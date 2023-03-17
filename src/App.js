//Import react, useState, useCallback, and useRef from react library
import React, { useState, useCallback, useRef } from "react";

//Import styles from App.css file
import "./App.css";

//Import create function from ipfs-http-client library
import { create } from "ipfs-http-client";

//Require Buffer from buffer library
const Buffer = require("buffer/").Buffer;

//Create an instance of the ipfs client
const ipfs = create({ host: "ipfs.local", port: 5001, protocol: "http" });

//Define App function component
function App() {
  //Define state variables
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);

  //Create a ref for cid
  const cidRef = useRef(null);

  //Define event handlers for form inputs
  const handleTitleChange = useCallback((event) => {
    setTitle(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    setDescription(event.target.value);
  }, []);

  const handleFileChange = useCallback((event) => {
    setFile(event.target.files[0]);
  }, []);

  //Define an event handler for form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    //Read the uploaded file as an array buffer
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    //Once the file is loaded, convert the array buffer to a Uint8Array
    reader.onloadend = async () => {
      const buffer = new Uint8Array(reader.result);

      //Upload the file to IPFS and get the CID
      const result = await ipfs.add({
        path: file.name,
        content: buffer,
      });
      const imageCid = result.cid.toString();

      //Create a metadata object with the title, description and image CID
      const metadata = {
        title,
        description,
        image: imageCid,
      };

      //Convert the metadata object to a JSON string
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));

      //Upload the metadata to IPFS and get the CID
      const metadataResult = await ipfs.add(metadataBuffer);
      const metadataCid = metadataResult.cid.toString();

      //Pin both the image and metadata CIDs
      await Promise.all([
        ipfs.pin.add(imageCid),
        ipfs.pin.add(metadataCid),
      ]);

      //Set the generated CID as the state variable
      setCid(metadataCid);
      cidRef.current = metadataCid;
    };
  }, [file, title, description]);

  //Define a click event handler for copying the CID to clipboard
  const handleCopyClick = useCallback(() => {
    const el = document.createElement("textarea");
    el.value = cidRef.current;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }, []);

  //Render the component
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
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                />
              </label>
              <label>
                <span>Description:</span>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                />
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

//Export App component
export default App;