import type { ProjectWorkflow as Workflow } from "./site-data";
import styles from "./project-presentation.module.css";

export function ProjectWorkflow({ workflow, compact = false }: { workflow: Workflow; compact?: boolean }) {
  return (
    <div className={`${styles.workflow} ${compact ? styles.cover : ""}`}>
      <p className={styles.flowLabel}>流程示意</p>
      <ol className={styles.steps} aria-label="使用流程">
        {workflow.steps.map((step, index) => (
          <li key={index}>
            <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {!compact && workflow.features.length > 0 ? (
        <ul className={styles.features} aria-label="主要功能">
          {workflow.features.map((feature, index) => <li key={index}>{feature}</li>)}
        </ul>
      ) : null}
      {workflow.note ? <p className={styles.note}>{workflow.note}</p> : null}
    </div>
  );
}
