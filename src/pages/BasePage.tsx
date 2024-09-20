import NavigationBar from "../components/NavigationBar";

export const BasePage = ({
  children,
  title,
}: {
  children: any;
  title: string;
}) => {
  const contentContainer = {
    width: "100%",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    justifySelf: "center",
    display: "flex",
    padding: "20px",
  };

  return (
    <div>
      <NavigationBar title={title}></NavigationBar>
      <div style={{ display: "flex", marginLeft: "auto", marginRight: "auto" }}>
        <div style={contentContainer}>
          <div style={{ width: "100%" }}>{children}</div>
        </div>
      </div>
    </div>
  );
};
