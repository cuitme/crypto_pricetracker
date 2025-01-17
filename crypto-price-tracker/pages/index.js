import Head from "next/head";
import { useEffect, useState } from "react";
import Arweave from "arweave";

// Initialize Arweave instance
const arweave = Arweave.init({});

export default function Home() {
  const [arweaveAddress, setArweaveAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("price");

  // Fetch cryptocurrency data
  const fetchCryptoData = async () => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCryptoData(data);
      } else {
        console.error("API response is not an array");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch crypto data only if wallet is connected
    if (isLoggedIn) {
      fetchCryptoData();
    }
  }, [isLoggedIn]);

  // Connect to Arweave wallet
  const connectArweaveWallet = async () => {
    try {
      if (!window.arweaveWallet) {
        alert("ArConnect extension is not installed or enabled.");
        return;
      }

      // Connect to Arweave Wallet
      await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);

      // Get active address
      const address = await window.arweaveWallet.getActiveAddress();

      // Ensure address is valid
      if (!address) {
        throw new Error("Failed to get an active address from the wallet.");
      }

      setArweaveAddress(address);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to connect Arweave wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // Disconnect Arweave Wallet
  const disconnectArweaveWallet = () => {
    setArweaveAddress(null);
    setIsLoggedIn(false);
  };

  // Sorting logic
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    sortData(option);
  };

  // Sort data based on the selected option
  const sortData = (option) => {
    const sortedData = [...cryptoData];
    if (option === "price") {
      sortedData.sort((a, b) => b.current_price - a.current_price); // Sort by price (highest first)
    } else if (option === "volume") {
      sortedData.sort((a, b) => b.total_volume - a.total_volume); // Sort by volume (highest first)
    }
    setCryptoData(sortedData);
  };

  return (
    <>
      <Head>
        <title>Crypto Price Tracker</title>
        <meta name="description" content="Track cryptocurrency prices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={styles.main}>
        <h1 style={styles.title}>Crypto Price Tracker</h1>

        {/* Add Image and Intro Text */}
        <div style={styles.intro}>
          <img src="" alt="Crypto" style={styles.image} />
          <p style={styles.introText}>Welcome to Crypto Price Tracker. Track real-time prices and sort cryptocurrency data based on your preferences!</p>
        </div>

        {/* Connect/Disconnect Arweave Wallet */}
        <div style={styles.controls}>
          {!isLoggedIn ? (
            <button onClick={connectArweaveWallet} style={styles.button}>
              Connect Arweave Wallet
            </button>
          ) : (
            <div style={styles.walletInfo}>
              <p>Dompet Arweave Anda sudah terkoneksi</p>
              <button onClick={disconnectArweaveWallet} style={styles.buttonred}>
                Disconnect Arweave Wallet
              </button>
            </div>
          )}
        </div>

        {/* Display message if Arweave wallet is not connected */}
        {!isLoggedIn && (
          <div style={styles.alert}>
            <p><strong>You must log in to your Arweave wallet first to view the latest prices and crypto volume.</strong></p>
          </div>
        )}

        {/* Crypto Prices Table */}
        {isLoggedIn && !loading && (
          <>
            <div style={styles.controls}>
              <label htmlFor="sortOption">Sort By: </label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={handleSortChange}
                style={styles.select}
              >
                <option value="price">Price (Highest)</option>
                <option value="volume">Volume (Highest)</option>
              </select>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, backgroundColor: "#3b5998", color: "#fff" }}>#</th>
                  <th style={{ ...styles.th, backgroundColor: "#3b5998", color: "#fff" }}>Name</th>
                  <th style={{ ...styles.th, backgroundColor: "#4CAF50", color: "#fff" }}>Price (USD)</th>
                  <th style={{ ...styles.th, backgroundColor: "#FF6347", color: "#fff" }}>Market Cap (USD)</th>
                  <th style={{ ...styles.th, backgroundColor: "#3b5998", color: "#fff" }}>Volume (USD)</th>
                </tr>
              </thead>
              <tbody>
                {cryptoData.map((coin, index) => (
                  <tr key={coin.id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{coin.name}</td>
                    <td style={{ ...styles.td, backgroundColor: "#000", color: "#fff" }}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(coin.current_price)}
                    </td>
                    <td style={styles.td}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(coin.market_cap)}
                    </td>
                    <td style={styles.td}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(coin.total_volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {loading && <p>Loading crypto prices...</p>}
      </main>
    </>
  );
}

const styles = {
  main: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    backgroundColor: "#4CAF50", 
    color: "#fff" 
  },
  intro: {
    textAlign: "center",
    marginBottom: "20px",
  },
  image: {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  introText: {
    fontSize: "18px",
    color: "#555",
    maxWidth: "600px",
    margin: "0 auto",
  },
  controls: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonred: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#FF6347",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  walletInfo: {
    textAlign: "center",
    marginTop: "10px",
  },
  alert: {
    textAlign: "center",
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#ffcccc",
    color: "#d8000c",
    borderRadius: "5px",
  },
  select: {
    padding: "5px",
    fontSize: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
};
