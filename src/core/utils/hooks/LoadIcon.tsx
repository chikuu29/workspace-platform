import React from "react";
import AsyncLoadIcon from "./AsyncLoadIcon";

const LoadIcon = React.memo(({ iconName, ...rest }: { iconName: string, [key: string]: any }) => {
  return <AsyncLoadIcon iconName={iconName} {...rest} />;
});

export default LoadIcon;
