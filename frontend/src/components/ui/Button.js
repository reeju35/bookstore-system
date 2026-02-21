import { theme } from "../../styles/theme";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  style = {}
}) => {

  const background =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
      ? theme.colors.danger
      : variant === "success"
      ? theme.colors.success
      : "#374151";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: theme.radius,
        background,
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontWeight: 500,
        transition: "0.2s ease",
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default Button;