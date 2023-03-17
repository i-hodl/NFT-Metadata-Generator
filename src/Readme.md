# NFT Metadata Generator

This is a React component that generates NFT metadata using IPFS. It allows the user to input a title, description, and file, and generates metadata with IPFS CID.

## Getting Started

Clone the repository and run `npm install` to install the necessary dependencies.

```bash
git clone [repository-url]
cd [repository]
npm install
```

Then run `npm start` to start the development server and view the component in a web browser.

```bash
npm start
```

## Dependencies

The metadata generator uses the following dependencies:

- React
- ipfs-http-client
- buffer

## Usage

The component renders a form with input fields for title, description, and file. When the user submits the form, the component reads the file and uploads it to IPFS, along with the metadata. It then generates an IPFS CID for the metadata, which can be copied to the clipboard using the "Copy CID" button.

## Contributing

Contributions are welcome! Fork the repository and create a pull request with changes.

## License

[MIT](https://choosealicense.com/licenses/mit/) license.