import styles from "./Title.module.css";

export default function Title() {
  return (
    <h1 className={styles.title}>
      <a href="/" className={styles.link}>
        Link Forge
      </a>
    </h1>
  );
}
