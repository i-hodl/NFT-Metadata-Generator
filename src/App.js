import React, { useState, useCallback, useRef } from "react";
import "./App.css";
import { create } from "ipfs-http-client";
const Buffer = require("buffer/").Buffer;
// change <dappnode.local> to your node and port
const ipfs = create({ host: "iNuc", port: 5001, protocol: "http" });

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);
  const [Artist, setArtist] = useState("");
  const [traits, setTraits] = useState([]);

  const cidRef = useRef(null);

  const handleTitleChange = useCallback((event) => {
    setTitle(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    setDescription(event.target.value);
  }, []);

  const handleArtistChange = useCallback((event) => {
    setArtist(event.target.value);
  }, []);

  const handleTraitKeyChange = useCallback(
    (event, index) => {
      const newTraits = traits.slice();
      newTraits[index] = {
        key: event.target.value,
        value: newTraits[index]?.value || "",
      };
      setTraits(newTraits);
    },
    [traits]
  );

  const handleTraitValueChange = useCallback(
    (event, index) => {
      const newTraits = traits.slice();
      newTraits[index] = {
        key: newTraits[index]?.key || "",
        value: event.target.value,
      };
      setTraits(newTraits);
    },
    [traits]
  );

  const handleAddTraitClick = useCallback(() => {
    const newTraits = traits.slice();
    newTraits.push({ key: "", value: "" });
    setTraits(newTraits);
  }, [traits]);

  const handleRemoveTraitClick = useCallback(() => {
    const newTraits = traits.slice();
    newTraits.pop();
    setTraits(newTraits);
  }, [traits]);

  const handleFileChange = useCallback((event) => {
    setFile(event.target.files[0]);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const reader = new window.FileReader();
    if (file) {
      reader.readAsArrayBuffer(file);
    }
    

    reader.onloadend = async () => {
      const buffer = new Uint8Array(reader.result);

      const result = await ipfs.add({
        path: file.name,
        content: buffer,
      });
      const imageCid = result.cid.toString();

      const metadata = {
        title,
        description,
        image: imageCid,
        Artist,
        traits,
      };

      const metadataBuffer = Buffer.from(JSON.stringify(metadata));

      const metadataResult = await ipfs.add(metadataBuffer);
      const metadataCid = metadataResult.cid.toString();

      await Promise.all([
        ipfs.pin.add(imageCid),
        ipfs.pin.add(metadataCid),
      ]);

      setCid(metadataCid);
      cidRef.current = metadataCid;
    };
  }, [file, title, description, Artist, traits]);

  const handleCopyClick = useCallback(() => {
    const el = document.createElement("textarea");
    el.value = cidRef.current;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }, []);

  return (
    <div className="App">
      <div className="terminal">
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text"></div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <div className="window-body">
            <form onSubmit={handleSubmit}>
              <label>
                <span>Title:</span>
                <input type="text" value={title} onChange={handleTitleChange} />
              </label>
              <label>
                <span>Description:</span>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                />
              </label>
              <label>
                <span>Artist:</span>
                <input type="text" value={Artist} onChange={handleArtistChange} />
              </label>
              <label>
                <span>Traits:</span>
                {traits.map((trait, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      placeholder="Key"
                      value={trait.key}
                      onChange={(event) =>
                        handleTraitKeyChange(event, index)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={trait.value}
                      onChange={(event) =>
                        handleTraitValueChange(event, index)
                      }
                    />
                    <button type="button" onClick={handleRemoveTraitClick}>
                      - Remove Trait
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddTraitClick}>
                  + Add Trait
                </button>
              </label>
              <label>
                <span>File:</span>
                <input type="file" onChange={handleFileChange} />
              </label>
              <button type="submit">Generate NFT Metadata</button>
            </form>
            {cid && (
              <div className="result">
                <div className="result-text">NFT created with CID:</div>
                <div className="result-cid">{cid}</div>
                <button onClick={handleCopyClick} className="copy-button">
                  Copy CID
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
