import { useState, useEffect } from "react";

import { MainCard } from "../components/MainCard";
import { ContentBox } from "../components/ContentBox";
import { Header } from "../components/Header";
import { DateAndTime } from "../components/DateAndTime";
// import { Search } from "../components/Search"; 
import { UpdateInfo } from "../components/UpdateInfo";

// supprimé - Plus de recherche manuelle pour les transports
import { MetricsBox } from "../components/MetricsBox";
import { UnitSwitch } from "../components/UnitSwitch";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorScreen } from "../components/ErrorScreen";

import styles from "../styles/Home.module.css";

export const App = () => {
  // supprimé - villes configurées dans config.json
  // const [cityInput, setCityInput] = useState("Riga"); 
  
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [unitSystem, setUnitSystem] = useState("metric");

  // ajouté - pour afficher l'heure de la dernière mise à jour
  const [lastUpdate, setLastUpdate] = useState(new Date()); 

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("api/data", {
          // modifié - garde POST mais sans body (Open-Meteo lit config.json)
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          // supprimé - body: JSON.stringify({ cityInput }) car ville dans config.json
        });
        
        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }
        
        const data = await res.json();
        setWeatherData({ ...data });

        // ajout - met à jour l'heure de la dernière mise à jour
        setLastUpdate(new Date()); 

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    getData();
  }, [triggerFetch]);

  // ajout - rafraîchit automatique toutes les heures 
  useEffect(() => {
    const interval = setInterval(() => {
      setTriggerFetch(prev => !prev);
      console.log('Rafraîchissement automatique des données météo');
    }, 3600000); // 3600000ms = 1 heure

    return () => clearInterval(interval);
  }, []);

  const changeSystem = () =>
    unitSystem == "metric"
      ? setUnitSystem("imperial")
      : setUnitSystem("metric");

  return weatherData && !weatherData.message ? (
    <div className={styles.wrapper}>
      <MainCard
        city={weatherData.name}
        country={weatherData.sys.country}
        description={weatherData.weather[0].description}
        iconName={weatherData.weather[0].icon}
        unitSystem={unitSystem}
        weatherData={weatherData}
      />
      <ContentBox>
        <Header>
          <DateAndTime weatherData={weatherData} unitSystem={unitSystem} />

          {/* supprimé - la barre de recherche plus nécessaire 
          <Search
            placeHolder="Search a city..."
            value={cityInput}
            onFocus={(e) => {
              e.target.value = "";
              e.target.placeholder = "";
            }}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              e.keyCode === 13 && setTriggerFetch(!triggerFetch);
              e.target.placeholder = "Search a city...";
            }}
          />
          */}
          
          {/* AJOUTÉ - Composant de mise à jour pour info des usagers */}
          <UpdateInfo lastUpdate={lastUpdate} />
        </Header>
        <MetricsBox weatherData={weatherData} unitSystem={unitSystem} />
        <UnitSwitch onClick={changeSystem} unitSystem={unitSystem} />
      </ContentBox>
    </div>
  ) : weatherData && weatherData.message ? (
    <ErrorScreen errorMessage="Erreur de configuration ou de réseau">
      {/* supprimé - plus de recherche en cas d'erreur
      <Search
        onFocus={(e) => (e.target.value = "")}
        onChange={(e) => setCityInput(e.target.value)}
        onKeyDown={(e) => e.keyCode === 13 && setTriggerFetch(!triggerFetch)}
      />
      */}
      {/* ajout - Message d'aide pour les opérateurs */}
      <div style={{textAlign: 'center', marginTop: '20px'}}>
        Vérifiez la configuration dans config.json
        <br />
        <small>Contact technique si le problème persiste</small>
      </div>
    </ErrorScreen>
  ) : (
    <LoadingScreen loadingMessage="Chargement des données météo..." />
  );
};

export default App;
