import { NextPage } from "next";

import Icon from "./icon";

const CloseIcon: NextPage<{ size?: number }> = ({ size = 16 }) => {
  return (
    <Icon size={size}>
      <svg
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 426.667 426.667"
        xmlSpace="preserve"
      >
        <polygon
          points="426.667,59.733 366.933,0 213.333,153.6 59.733,0 0,59.733 153.6,213.333 0,366.933 59.733,426.667 
			213.333,273.067 366.933,426.667 426.667,366.933 273.067,213.333 		"
        />
      </svg>
    </Icon>
  );
};

export default CloseIcon;
