import pandas as pd
import numpy as np

# Importa i due dataset dalla cartella dataset
departures = pd.read_csv('dataset/International_Report_Departures.csv')
passengers = pd.read_csv('dataset/International_Report_Passengers.csv')

# Visualizza le prime righe dei dataset
#print(departures.head())
#print(passengers.head())

#print('Il dataset departures ha', len(departures), 'campioni')
#print('Il dataset passengers ha', len(passengers), 'campioni')

#Verifico se ci sono dei duplicati nei dataset
#print('Il dataset departures ha', len(departures[departures.duplicated()]), 'duplicati')
#print('Il dataset passengers ha', len(passengers[passengers.duplicated()]), 'duplicati')

#Cancello le colonne non utili ai fini dell'analisi o ridondanti
#date_dte è ridondante con Year e Month
#usg_apt_id e fg_apt_id sono ridondanti con usg_apt e fg_apt
#type serve solo per suddividere i due dataset (non utilie perché verranno uniti)
#carriergroup è un dato che non mi serve
#Scheduled e Charter sono le due tipologie di voli, ma sono sommate in Total (semplificazione)
#usg_wac e fg_wac sono codici IATA delle zone mondiali, ma le implemento con i codici IATA degli aeroporti
#airlineid è un dato ridondante con carrier
departures = departures.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Scheduled', 'Charter', 'usg_wac', 'fg_wac', 'airlineid'], axis=1)
passengers = passengers.drop(columns=['data_dte', 'usg_apt_id', 'fg_apt_id', 'type', 'carriergroup', 'Scheduled', 'Charter', 'usg_wac', 'fg_wac', 'airlineid'], axis=1)

# Rinomino le colonne per una migliore comprensione
departures = departures.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport', 'carrier': 'Airline', 'Total': 'Flights'})
passengers = passengers.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport', 'carrier': 'Airline', 'Total': 'Passengers'})

print(departures.head())
print(passengers.head())

# Unisce i due dataset in un unico dataset usando come chiave di join le colonne comuni (se non ci sono corrispondenze, non vengono inserite righe)
#L'inner join è usato per mantenere solo le righe che hanno corrispondenze in entrambi i dataset
data = pd.merge(departures, passengers, on=['Year', 'Month', 'US_Airport', 'FG_Airport', 'Airline'], how='inner')

#Quantifica la differenza tra i dataset iniziali e quello finale (significa che ci sono delle righe che non hanno corrispondenze)
print('La differenza tra i dataset iniziali e quello finale è di',  len(passengers) - len(data), 'righe')


#US_Ariport e FG_Airport sono codici IATA, essi corrisspondono a un aeroporto specifico in un determinato Stato. Voglio creare una colonna con il nome dello Stato
# Importo il dataset con i codici IATA degli aeroporti
iata_codes = pd.read_csv('dataset/airport-codes.csv')

iata_codes = iata_codes[['iata_code', 'name', 'iso_country', 'iso_region']]# Seleziono solo le colonne IATA continent e iso_country

# Unisco il dataset IATA con il dataset principale per ottenere i nomi degli Stati
data = pd.merge(data, iata_codes[['iata_code', 'iso_region', 'name']], left_on='US_Airport', right_on='iata_code', how='left')
data['US_State'] = np.where(data['iso_region'].str.startswith('US-'), data['iso_region'].str[3:], data['iso_region'])
data = data.rename(columns={'name': 'US_Airport_Name'})
data = data.drop(columns=['iata_code', 'iso_region'])

data = pd.merge(data, iata_codes[['iata_code', 'iso_country', 'name']], left_on='FG_Airport', right_on='iata_code', how='left')
data = data.rename(columns={'iso_country': 'FG_State', 'name': 'FG_Airport_Name'})
data = data.drop(columns=['iata_code'])

#pycountry è una libreria che permette di ottenere il nome completo di uno Stato partendo dal codice ISO

# Riordina le colonne per posizionare US_State dopo US_Airport e poi name
cols = data.columns.tolist()
us_airport_index = cols.index('US_Airport')
cols.insert(us_airport_index + 1, cols.pop(cols.index('US_State')))
cols.insert(us_airport_index + 2, cols.pop(cols.index('US_Airport_Name')))

fg_airport_index = cols.index('FG_Airport')
cols.insert(fg_airport_index + 1, cols.pop(cols.index('FG_State')))
cols.insert(fg_airport_index + 2, cols.pop(cols.index('FG_Airport_Name')))

data = data[cols]

#Ora voglio fare in modo che le tratte rispetto agli aeroporti siano uniche, quindi raggruppo per compagnia aerea sommando i voli e i passeggeri per poi cancellare la colonna Airline
data = data.drop(columns=['Airline','Month'])

# Raggruppa per le colonne specificate e somma i valori di 'Passengers' e 'Flights'
data = data.groupby(['Year', 'US_Airport','US_Airport_Name' ,'US_State', 'FG_Airport', 'FG_State', 'FG_Airport_Name'], as_index=False).agg({
    'Passengers': 'sum',
    'Flights': 'sum'
})

#drop dei campioni che hanno meno di un tot di passeggeri
data = data.drop(data[(data['Passengers'] < 100) | (data['Flights'] < 10)].index)


print(data.head())

print('Il dataset finale ha', len(data), 'campioni')

#Quanti aeroporti diversi ci sono in US_Airport
print('Ci sono', len(data['US_Airport'].unique()), 'aeroporti negli Stati Uniti')

#Salva il dataset finale in un file csv
data.to_csv('dataset/International_Report.csv', index=False)

#Converti il dataset in un file json
data.to_json('dataset/International_Report.json', orient='records', indent=4)

#Json è più compatto e leggibile, ma è molto pesante. Infatti per github ha dei problemi ad essere caricato.
#Quindi o installiamo git lfs (per il caricamento di file pesanti su git) o usiamo il csv oppure droppiamo un po' di campioni

