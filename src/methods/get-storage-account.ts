import { web3 } from "@project-serum/anchor";
import { SHDW_DRIVE_ENDPOINT } from "../utils/common";
import {ShadowDriveVersion, StorageAccountInfo, StorageAccountResponse} from "../types";
import fetch from "node-fetch";
/**
 * Get storage account details
 * @param {PublicKey} key - Publickey of a Storage Account
 * @param {ShadowDriveVersion} version - ShadowDrive version (v1 or v2)
 * @returns {StorageAccountInfo} Storage Account
 *
 * TODO: On next major release make version a required parameter and remove StorageAccountInfo type
 */
export default async function getStorageAcc(
  key: web3.PublicKey,
  version?: ShadowDriveVersion
): Promise<StorageAccountInfo & StorageAccountResponse> {
  try {
    // Only return new response type when providing version
    if (version) {
        const response: any = {
            publicKey: key,
        };
        switch (version.toLocaleLowerCase()) {
            case "v1":
                response.account = await this.program.account.storageAccount.fetch(key);
                break;
            case "v2":
                response.account = await this.program.account.storageAccountV2.fetch(key);
                break;
        }
        return response;
    }

    const storageInfoResponse = await fetch(
      `${SHDW_DRIVE_ENDPOINT}/storage-account-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storage_account: key,
        }),
      }
    );
    if (!storageInfoResponse.ok) {
      return Promise.reject(
        new Error(
          `Server response status code: ${
            storageInfoResponse.status
          } \n Server response status message: ${
            (await storageInfoResponse.json()).error
          }`
        )
      );
    }
    return Promise.resolve(await storageInfoResponse.json());
  } catch (e) {
    return Promise.reject(new Error(e));
  }
}
