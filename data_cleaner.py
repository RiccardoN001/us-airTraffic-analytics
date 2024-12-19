import pandas as pd
import numpy as np
import json

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
#usg_apt_id e fg_apt_id (codici univoci) sono ridondanti con usg_apt e fg_apt (sigle univoche)
#type serve solo per riconoscere i due dataset (non utile perché verranno uniti)
#carriergroup, airlineid, carrier e usg_wac e fg_wac sono dati che non ci servono per l'analisi
#Charter e Total sono rimossi perché analizzeremo solo i voli di linea programmati
departures = departures.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Total', 'Charter', 'usg_wac', 'fg_wac', 'airlineid', 'carrier'], axis=1)
passengers = passengers.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Total', 'Charter', 'usg_wac', 'fg_wac', 'airlineid', 'carrier'], axis=1)

# Rinomino le colonne per una migliore comprensione
departures = departures.rename(columns={'usg_apt': 'US_Airport_IATA', 'fg_apt': 'FG_Airport_IATA', 'Scheduled': 'Flights'})
passengers = passengers.rename(columns={'usg_apt': 'US_Airport_IATA', 'fg_apt': 'FG_Airport_IATA', 'Scheduled': 'Passengers'})


# Unisce i due dataset in un unico dataset usando come chiave di join le colonne in comune tra i due dataset
# inner join è usato per mantenere solo le righe che hanno corrispondenze in entrambi i dataset
data = pd.merge(departures, passengers, on=['Year', 'Month', 'US_Airport_IATA', 'FG_Airport_IATA'], how='inner')

#Quantifica la differenza tra i dataset iniziali e quello finale (significa che ci sono delle righe che non hanno corrispondenze)
print('La differenza tra i dataset iniziali e quello finale è di',  len(passengers) - len(data), 'righe')


#US_Airport_IATA e FG_Airport_IATA sono codici IATA, essi corrisspondono a un aeroporto specifico in un determinato Stato. 
# Voglio creare una colonna con il nome dello Stato
# Importo il dataset con i codici IATA degli aeroporti
iata_codes = pd.read_csv('dataset/iata_codes.csv')

#rimuovo eventuali duplicati dal dataset iata_codes
iata_codes = iata_codes.drop_duplicates(subset=['iata_code'])

#merge tra data e iata_codes per ottenere il nome degli Stati, usando come chiave di join le colonne US_Airport_IATA e FG_Airport_IATA
data = pd.merge(data, iata_codes, left_on='US_Airport_IATA', right_on='iata_code', how='inner')
data = data.rename(columns={'Country_Name': 'US_State', 'Country_Code': 'US_State_id', 'Continent': 'US_Continent'})
data = data.drop(columns=['iata_code'], axis=1)
#rimuovi tutti i campioni che hanno us_state_id che non inizia con 'US-'
data = data.drop(data[~data['US_State_id'].str.startswith('US-')].index)

data = pd.merge(data, iata_codes, left_on='FG_Airport_IATA', right_on='iata_code', how='inner')
data = data.rename(columns={'Country_Name': 'FG_State', 'Country_Code': 'FG_State_id', 'Continent': 'FG_Continent'})
data = data.drop(columns=['iata_code'], axis=1)


#Riordino le colonne nell'ordine che preferisco
column_order = [
    'Year', 'Month', 'US_Airport_IATA', 'US_State', 'US_State_id', 'US_Continent', 
    'FG_Airport_IATA', 'FG_State', 'FG_State_id', 'FG_Continent', 'Flights', 'Passengers'
]
data = data[column_order]


#raggruppo le tuple con stessi attributi: 
#'Year','Month', 'US_State' ,'US_State_id', 'US_Continent', 'FG_State', 'FG_State_id', 'FG_Continent'
#sommando il numero di voli ed il numero di passeggeri
data = data.drop(columns=['US_Airport_IATA', 'FG_Airport_IATA'])
data = data.groupby(['Year','Month', 'US_State' ,'US_State_id', 'US_Continent', 'FG_State', 'FG_State_id', 'FG_Continent'], as_index=False).agg({
    'Passengers': 'sum',
    'Flights': 'sum'
})


#drop dei campioni che hanno 0 passeggeri o voli
data = data.drop(data[(data['Passengers'] == 0) | (data['Flights'] == 0)].index)

#conta gli stati US_state_id unici
print('Ci sono', len(data['US_State_id'].unique()), 'stati negli Stati Uniti')

#stampa il numero di passeggeri minimo e massimo di tutti i collegamenti
print('Il numero minimo di passeggeri è', data['Passengers'].min())
print('Il numero massimo di passeggeri è', data['Passengers'].max())
#stampa il numero di voli minimo e massimo di tutti i collegamenti
print('Il numero minimo di voli è', data['Flights'].min())
print('Il numero massimo di voli è', data['Flights'].max())

#Verifica del dataset finale (head, lunghezza e valori nulli)
print(data.head())

print('Il dataset finale ha', len(data), 'campioni')

print(data.isnull().sum())

# stati non presenti sulla json world-states (mappa)
states_to_remove = [
    "Antigua and Barbuda", "Aruba", "Barbados", "Bermuda", "Cape Verde",
    "Cayman Islands", "Cook Islands", "French Polynesia", "Gibraltar",
    "Grenada", "Guadeloupe", "Hong Kong", "Kiribati", "Macau",
    "Marshall Islands", "Martinique", "Netherlands Antilles",
    "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "Singapore",
    "Turks and Caicos Islands", "Tonga", "French Guiana", "Bahrain"
]

data = data[~data['FG_State'].isin(states_to_remove)]

print(data.head())
# Stampa il numero di campioni nel DataFrame filtrato
print(f"Numero di campioni nel DataFrame filtrato: {len(data)}")

#Salva il dataset finale in un file csv
data.to_csv('dataset/International_Report.csv', index=False)


###############################################################  JSON  ###############################################################

#Voglio creare un file json suddiviso in nodi (che rappresentano gli Stati) e archi (che rappresentano le tratte)
#Gli stati avranno come attributi il nome, il codice ISO e il continente
#Le tratte avranno come attributi il numero di voli e passeggeri, l'aeroporto di partenza e di arrivo e l'anno e mese

#Nodi (stati)
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

# Archi (tratte)
edges = []
for _, row in data.iterrows():
  edges.append({
    'US_state': row['US_State'],
    'FG_state': row['FG_State'],
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