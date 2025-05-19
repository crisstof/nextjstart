import styles from './loading.module.css';
export function Loading() {
    return(
        <div id={styles.loading}>
            <div className={styles.load1}></div>
            <div className={styles.load2}></div>
            <div className={styles.load3}></div>
        </div>
    )
}