import pandas as pd
import numpy as np
import json


# Importa i due dataset dalla cartella dataset
departures = pd.read_csv('dataset/International_Report_Departures.csv')
passengers = pd.read_csv('dataset/International_Report_Passengers.csv')

# Visualizza le prime righe dei dataset
print(departures.head())
print(passengers.head())

print('Il dataset departures ha', len(departures), 'campioni')
print('Il dataset passengers ha', len(passengers), 'campioni')

#Verifico se ci sono dei duplicati nei dataset
print('Il dataset departures ha', len(departures[departures.duplicated()]), 'duplicati')
print('Il dataset passengers ha', len(passengers[passengers.duplicated()]), 'duplicati')

#Cancello le colonne non utili ai fini dell'analisi o ridondanti
#date_dte è ridondante con Year e Month
#usg_apt_id e fg_apt_id sono ridondanti con usg_apt e fg_apt
#type serve solo per suddividere i due dataset (non utilie perché verranno uniti)
#carriergroup è un dato che non mi serve
#Charter e Total sono rimossi perché analizzeremo solo i voli di linea programmati
#usg_wac e fg_wac sono codici IATA delle zone mondiali, ma le implemento con i codici IATA degli aeroporti
#airlineid è un dato ridondante con carrier poiché Carrirer è un identificativo univoco per ogni compagnia aerea
departures = departures.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Total', 'Charter', 'usg_wac', 'fg_wac', 'airlineid'], axis=1)
passengers = passengers.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Total', 'Charter', 'usg_wac', 'fg_wac', 'airlineid'], axis=1)

# Rinomino le colonne per una migliore comprensione
departures = departures.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport', 'carrier': 'Airline', 'Scheduled': 'Flights'})
passengers = passengers.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport', 'carrier': 'Airline', 'Scheduled': 'Passengers'})


# Unisce i due dataset in un unico dataset usando come chiave di join le colonne comuni (se non ci sono corrispondenze, non vengono inserite righe)
#L'inner join è usato per mantenere solo le righe che hanno corrispondenze in entrambi i dataset
data = pd.merge(departures, passengers, on=['Year', 'Month', 'US_Airport', 'FG_Airport', 'Airline'], how='inner')

#Quantifica la differenza tra i dataset iniziali e quello finale (significa che ci sono delle righe che non hanno corrispondenze)
print('La differenza tra i dataset iniziali e quello finale è di',  len(passengers) - len(data), 'righe')


#US_Ariport e FG_Airport sono codici IATA, essi corrisspondono a un aeroporto specifico in un determinato Stato. Voglio creare una colonna con il nome dello Stato
# Importo il dataset con i codici IATA degli aeroporti
iata_codes = pd.read_csv('dataset/iata_codes.csv')


#Fai un merge tra data e iata_codes per ottenere il nome degli Stati, usando come chiave di join le colonne US_Airport e FG_Airport
data = pd.merge(data, iata_codes, left_on='US_Airport', right_on='iata_code', how='inner')
data = data.rename(columns={'Country_Name': 'US_State', 'Country_Code': 'US_State_id', 'Continent': 'US_Continent'})
data = data.drop(columns=['iata_code'], axis=1)

data = pd.merge(data, iata_codes, left_on='FG_Airport', right_on='iata_code', how='inner')
data = data.rename(columns={'Country_Name': 'FG_State', 'Country_Code': 'FG_State_id', 'Continent': 'FG_Continent'})
data = data.drop(columns=['iata_code'], axis=1)


#Riordino le colonne nell'ordine che preferisco
column_order = [
    'Year', 'Month', 'US_Airport', 'US_State', 'US_State_id', 'US_Continent', 
    'FG_Airport', 'FG_State', 'FG_State_id', 'FG_Continent', 'Flights', 'Passengers'
]
data = data[column_order]


#Ora voglio fare in modo che le tratte rispetto agli aeroporti siano uniche, quindi raggruppo per compagnia aerea sommando i voli e i passeggeri per poi cancellare la colonna Airline
data = data.drop(columns=['US_Airport', 'FG_Airport'])
data = data.groupby(['Year','Month', 'US_State' ,'US_State_id', 'US_Continent', 'FG_State', 'FG_State_id', 'FG_Continent'], as_index=False).agg({
    'Passengers': 'sum',
    'Flights': 'sum'
})


#drop dei campioni che hanno meno di un tot di passeggeri o voli
data = data.drop(data[(data['Passengers'] < 100) | (data['Flights'] < 4)].index)


#Verifica del dataset finale (head, lunghezza e valori nulli)
print(data.head())

print('Il dataset finale ha', len(data), 'campioni')

print(data.isnull().sum())

#Salva il dataset finale in un file csv
data.to_csv('dataset/International_Report.csv', index=False)


###############################################################  JSON  ###############################################################

#Voglio creare un file json suddiviso in nodi (che erappresentano gli Stati) e archi (che rappresentano le tratte)
#Gli stati avranno come attributi il nome, il codice ISO e il continente
#Le tratte avranno come attributi il numero di voli e passeggeri, l'aeroporto di partenza e di arrivo e l'anno e mese

#Noti (stati)
nodes = []
for state in pd.concat([data['US_State'], data['FG_State']]).unique():
    # Per trovare il codice ISO e il continente, dobbiamo verificare prima se lo stato è negli Stati Uniti o in un altro paese
    if state in data['US_State'].values:
        # Se lo stato è negli Stati Uniti, prendi il codice ISO da US_State_id e il continente da US_Continent
        iso_code = data[data['US_State'] == state]['US_State_id'].values[0]
        continent = data[data['US_State'] == state]['US_Continent'].values[0]
    elif state in data['FG_State'].values:
        # Se lo stato è in un altro paese, prendi il codice ISO da FG_State_id e il continente da FG_Continent
        iso_code = data[data['FG_State'] == state]['FG_State_id'].values[0]
        continent = data[data['FG_State'] == state]['FG_Continent'].values[0]
    else:
        # Se non trovi lo stato, salta
        continue
    
    # Aggiungi il nodo con il nome, il codice ISO e il continente
    nodes.append({
        'name': state,
        'iso_code': iso_code,
        'continent': continent
    })

# Arichi (tratte)
edges = []
for _, row in data.iterrows():
  edges.append({
    'source': row['US_State'],
    'target': row['FG_State'],
    'flights': row['Flights'],
    'passengers': row['Passengers'],
    'year': row['Year'],
    'month': row['Month']
  })

dataset = {
  'nodes': nodes,
  'edges': edges
}

print(len(dataset['nodes']), len(dataset['edges']))

with open('dataset/International_Report.json', 'w') as f:
  json.dump(dataset, f, indent=3)

