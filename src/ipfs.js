import { create } from "ipfs-http-client";
//change host and port below for local setup
const ipfs = create({ host: "ipfs.local", port: 5001, protocol: "http" });

const form = document.getElementById("upload-form");
const result = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const { cid, error } = await uploadToIpfs(formData);
  if (error) {
    result.textContent = `Error uploading to IPFS: ${error}`;
  } else {
    result.innerHTML = `CID: <a href="https://ipfs.io/ipfs/${cid}" target="_blank">${cid}</a>`;
  }
});

async function uploadToIpfs(formData) {
  try {
    const files = formData.getAll("image");
    const file = files[0];
    const fileData = await file.arrayBuffer();
    const metadata = {
      title: formData.get("title"),
      description: formData.get("description"),
    };
    const metadataData = new TextEncoder().encode(JSON.stringify(metadata));
    const [imageCid, metadataCid] = await Promise.all([
      ipfs.add(fileData),
      ipfs.add(metadataData),
    ]);

    const [imagePin, metadataPin] = await Promise.all([
      ipfs.pin.add(imageCid.cid),
      ipfs.pin.add(metadataCid.cid),
    ]);

    if (!imagePin || !metadataPin) {
      return { error: "Failed to pin files to IPFS node." };
    }

    const cid = await ipfs.object.patch.addLink(
      imageCid.path,
      metadataCid.cid.toString(),
      metadata.title
    );

    console.log("Files pinned successfully:", imageCid.cid, metadataCid.cid);
    return { cid: cid.toString() };
  } catch (error) {
    console.error("Error uploading files to IPFS:", error);
    return { error: error.message };
  }
}
