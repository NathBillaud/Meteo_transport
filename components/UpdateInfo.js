import styles from "./UpdateInfo.module.css";

export const UpdateInfo = ({ lastUpdate }) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.time}>
        Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
      </p>
      <small className={styles.info}>
        Données rafraîchies automatiquement toutes les heures
      </small>
    </div>
  );
};