import pandas as pd

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
#type serve solo per suddividere i due dataset (non utilie perché verranno uniti)
#Scheduled e Charter sono le due tipologie di voli, ma sono sommate in Total (semplificazione)
departures = departures.drop(['data_dte','type', 'Scheduled', 'Charter'], axis=1)
passengers = passengers.drop(['data_dte','type', 'Scheduled', 'Charter'], axis=1)

# Rinomino le colonne per una migliore comprensione
departures = departures.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','usg_wac': 'US_worldArea','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport','fg_wac': 'FG_worldArea', 'carrier': 'Airline','carriergroup': 'isAmerican', 'Total': 'Departures'})
passengers = passengers.rename(columns={'usg_apt_id': 'US_Airport_id','usg_apt': 'US_Airport','usg_wac': 'US_worldArea','fg_apt_id': 'FG_Airport_id', 'fg_apt': 'FG_Airport','fg_wac': 'FG_worldArea', 'carrier': 'Airline','carriergroup': 'isAmerican', 'Total': 'Passengers'})

print(departures.head())
print(passengers.head())

# Unisce i due dataset in un unico dataset usando come chiave di join le colonne comuni (se non ci sono corrispondenze, non vengono inserite righe)
#L'inner join è usato per mantenere solo le righe che hanno corrispondenze in entrambi i dataset
data = pd.merge(departures, passengers, on=['US_Airport_id', 'US_Airport', 'US_worldArea', 'FG_Airport_id', 'FG_Airport', 'FG_worldArea', 'Airline','airlineid', 'isAmerican', 'Year', 'Month'], how='inner')

print(data.head())

print('La differenza tra i dataset iniziali e quello finale è di',  len(passengers) - len(data), 'righe')
print('Il dataset finale ha', len(data), 'campioni')

#Salva il dataset finale in un file csv
data.to_csv('dataset/International_Report.csv', index=False)

#Converti il dataset in un file json
data.to_json('dataset/International_Report.json', orient='records')
