const macro =
  (Component) =>
  // eslint-disable-next-line react/display-name
  ({ ...props }) => {
    return <Component {...props} {...{}} />;
  };

export default macro;
