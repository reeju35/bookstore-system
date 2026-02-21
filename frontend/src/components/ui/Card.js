import { theme } from "../../styles/theme";

const Card = ({ children, style = {} }) => {
  return (
    <div
      style={{
        background: theme.colors.card,
        padding: "20px",
        borderRadius: theme.radius,
        boxShadow: theme.shadow.card,
        marginBottom: "20px",
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Card;