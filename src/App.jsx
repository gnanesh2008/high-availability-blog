
import { useState } from "react";
import "./App.css";

function App() {
  const [commits, setCommits] = useState([]);
  const [blinking, setBlinking] = useState(false);
  const [message, setMessage] = useState("Waiting for commits...");
  const [status, setStatus] = useState("WAITING");
  const [lastCommit, setLastCommit] = useState("None");
  const [events, setEvents] = useState(0);

  const simulatePush = () => {
    const newCommit = {
      id: Math.random().toString(16).slice(2, 9),
      message: "Updated blog application",
      branch: "main",
      author: "Developer",
      time: new Date().toLocaleTimeString(),
    };

    setCommits((old) => [newCommit, ...old]);
    setMessage(newCommit.message);
    setLastCommit(newCommit.time);
    setStatus("PUSH SUCCESSFUL");
    setEvents((old) => old + 1);
    setBlinking(true);

    setTimeout(() => setBlinking(false), 3000);
  };

  return (
    <div className="dashboard">

      <header className="topbar">
        <div>
          <h1>⚡ IoT COMMAND CENTER</h1>
          <p>HIGH AVAILABILITY BLOG · GITHUB MONITORING SYSTEM</p>
        </div>
        <div className="live-status">
          <span className="live-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      <section className="metrics">

        <Metric title="TOTAL COMMITS" value={commits.length} icon="↗" />
        <Metric title="COMMITS TODAY" value={commits.length} icon="◷" />
        <Metric title="ACTIVE REPOS" value="1" icon="▣" />
        <Metric title="LAST COMMIT TIME" value={lastCommit} icon="◷" />
        <Metric title="SUCCESSFUL EVENTS" value={events} icon="✓" />
        <Metric title="FAILED EVENTS" value="0" icon="⚠" />

      </section>

      <div className="section-heading">
        <div>
          <h3>VIRTUAL HARDWARE EMULATION BENCH</h3>
          <p>ESP32 + RGB LED + OLED display simulation</p>
        </div>
        <span className="simulation-badge">SIMULATION MODE ONLINE</span>
      </div>

      <main className="hardware-grid">

        {/* RGB LED PANEL */}

        <section className="panel">

          <div className="panel-heading">
            <span>● VIRTUAL LED INDICATOR</span>
            <small>GPIO 2 · Digital Output</small>
          </div>

          <div className="led-area">
            <div className={`led-ring ${blinking ? "blink" : ""}`}>
              <div className="led-light"></div>
            </div>

            <div className="led-label">
              <span className={blinking ? "green" : ""}>●</span>
              {blinking ? "NEW COMMIT DETECTED" : "WAITING FOR COMMITS"}
            </div>

            <p>Single pulse on GitHub push</p>
          </div>

          <div className="mini-stats">
            <div>
              <small>◈ Detected Commits</small>
              <strong>{commits.length}</strong>
            </div>
            <div>
              <small>◷ Last Commit</small>
              <strong>{lastCommit}</strong>
            </div>
          </div>

          <button className="test-button" onClick={simulatePush}>
            ⚡ Test LED Flash (Hardware Sim)
          </button>

          <p className="note">
            Diagnostic virtual pulse only · Does not create an AWS commit
          </p>

        </section>

        {/* OLED PANEL */}

        <section className="panel">

          <div className="panel-heading">
            <span>▣ VIRTUAL OLED DISPLAY</span>
            <small>128x64 · I²C Emulation</small>
          </div>

          <div className="oled-frame">
            <div className="oled-screen">

              <div className="oled-top">
                <span>ESP32 MONITOR</span>
                <span>● {status}</span>
              </div>

              <div className="oled-divider"></div>

              <p>» LATEST COMMIT:</p>
              <h3>{message}</h3>

              {commits.length > 0 && (
                <>
                  <p>BRANCH: {commits[0].branch}</p>
                  <p>ID: {commits[0].id}</p>
                  <p>AUTHOR: {commits[0].author}</p>
                </>
              )}

              <div className="oled-bottom">
                <span>READY</span>
                <span>MQTT: CONNECTING SOON</span>
              </div>

            </div>
          </div>

          <div className="oled-footer">
            <span className="selected">Summary</span>
            <span>Detail</span>
            <span>Pinout</span>
            <span className="oled-indicator">● ● ●</span>
          </div>

        </section>

        {/* ESP32 PANEL */}

        <section className="panel">

          <div className="panel-heading">
            <span>▣ VIRTUAL ESP32 CONTROLLER</span>
            <small className="firmware">FIRMWARE v2.4.1</small>
          </div>

          <div className="board">

            <div className="board-top">
              <div>
                <strong>ESP-WROOM-32</strong>
                <small>DUAL CORE · 240MHz</small>
              </div>
              <div className="green">WiFi: ONLINE</div>
            </div>

            <div className="board-middle">
              <span>GPIO 2 (LED)</span>
              <span className="green">ACTIVE</span>
            </div>

            <div className="board-middle">
              <span>GPIO 21 (SDA)</span>
              <span className="green">OLED READY</span>
            </div>

            <div className="board-middle">
              <span>I²C BUS</span>
              <span className="green">READY</span>
            </div>

            <div className="board-middle">
              <span>MQTT CLIENT</span>
              <span className="green">SIMULATED</span>
            </div>

          </div>

          <div className="controller-stats">
            <div>
              <small>Free Heap</small>
              <strong>216 KB</strong>
            </div>
            <div>
              <small>Uptime</small>
              <strong>00h 00m</strong>
            </div>
            <div>
              <small>MQTT Channel</small>
              <strong className="green">PENDING</strong>
            </div>
          </div>

        </section>

      </main>

      {/* COMMIT HISTORY */}

      <section className="history panel">
        <div className="panel-heading">
          <span>◈ GITHUB COMMIT ACTIVITY</span>
          <small>RECENT EVENTS</small>
        </div>

        {commits.length === 0 ? (
          <p className="empty">No commits detected yet. Waiting for GitHub push...</p>
        ) : (
          commits.map((commit) => (
            <div className="commit-row" key={commit.id}>
              <span className="green">●</span>
              <div>
                <strong>{commit.message}</strong>
                <small>{commit.id} · {commit.branch} · {commit.author}</small>
              </div>
              <time>{commit.time}</time>
            </div>
          ))
        )}
      </section>

      <footer>
        HIGH AVAILABILITY BLOG · VIRTUAL IoT MONITORING DASHBOARD
        <span>GITHUB + AWS INTEGRATION PENDING</span>
      </footer>

    </div>
  );
}

function Metric({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div>
        <span>{title}</span>
        <b>{icon}</b>
      </div>
      <strong>{value}</strong>
      <small>Monitoring active</small>
    </div>
  );
}

export default App;
