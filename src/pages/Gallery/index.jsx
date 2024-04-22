import axios from "axios";
import { map } from "lodash";
import React, { Children, Fragment, useEffect, useState } from "react";

function Gallery({}) {
  const [data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await axios({
        url: "https://cp10xoec24.execute-api.eu-west-1.amazonaws.com/default/zeba_lambda",
      });
      setData(data.Items);
    })();
  }, []);

  console.log(data);
  return (
    <Fragment>
      {Children.toArray(
        map(data, (item) => {
          return (
            <img
              src={item?.url}
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                float: "left",
                margin: "10px",
                objectFit: "contain",
              }}
            />
          );
        })
      )}
    </Fragment>
  );
}

export default Gallery;
