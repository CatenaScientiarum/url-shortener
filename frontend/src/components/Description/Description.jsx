import styles from "./Description.module.css";

export default function Description({ description, withPadding = false }) {
  return (
    <h1 className={`${styles.description} ${withPadding ? styles.withPadding : ""}`}>
      {description}
    </h1>
  );
}