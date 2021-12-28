import { NextPage } from "next";

import Icon from "./icon";

const LinkIcon: NextPage<{ size?: number }> = ({ size = 16 }) => {
  return (
    <Icon size={size}>
      <svg
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 375 375"
        xmlSpace="preserve"
      >
        <polygon points="337.5,187.5 337.5,337.5 37.5,337.5 37.5,37.5 187.5,37.5 187.5,0 0,0 0,375 375,375 375,187.5" />
        <polygon points="225,0 279,54 172.7,160.3 214.7,202.3 321,96 375,150 375,0" />
      </svg>
    </Icon>
  );
};

export default LinkIcon;
