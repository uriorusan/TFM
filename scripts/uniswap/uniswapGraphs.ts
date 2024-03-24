import axios from 'axios';
const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const skip = 0;

axios.post(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    {"query": `{ ticks(
          where: {poolAddress: "${poolAddress.toLowerCase()}", liquidityNet_not: "0"}
          first: 1000,
          skip: ${skip},
          orderBy: tickIdx,
          orderDirection: asc
        ) {
          tickIdx
          liquidityGross
          liquidityNet
        }
      }`
    },
    {
        headers: {
            "Content-Type": "application/json"
        }
    }
).then(response => {
    console.log(response.data);
});