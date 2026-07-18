import Cryptr from "cryptr";

const cryption = new Cryptr(
  process.env.ENCRYPTION_STRING ||
    "build-placeholder-encryption-string-change-me"
);

export default cryption;
