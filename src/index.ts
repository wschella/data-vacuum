import path from "path";
import fs from "fs";

import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

import { people_v1 } from "googleapis/build/src/apis/people/v1";
import { Credentials, OAuth2Client } from "google-auth-library";

const OAUTH_KEY_PATH = path.join(__dirname, "../oauth2.keys.json");

async function getOAuthClient(): Promise<OAuth2Client> {
  const credentials: Credentials = JSON.parse(
    fs.readFileSync("credentials.json").toString()
  );

  console.log(credentials.expiry_date, Date.now());
  // Don't need to authenticate
  if (credentials.expiry_date && credentials.expiry_date > Date.now()) {
    const client = new OAuth2Client(
      JSON.parse(fs.readFileSync(OAUTH_KEY_PATH).toString())
    );
    client.setCredentials(credentials);
    return client;
  }
  // We do need to authenticate
  else {
    const client = await authenticate({
      scopes: ["https://www.googleapis.com/auth/contacts.readonly"],
      keyfilePath: OAUTH_KEY_PATH,
    });

    fs.writeFileSync("credentials.json", JSON.stringify(client.credentials));

    return client;
  }
}

async function main() {
  const localAuth = await getOAuthClient();

  google.options({ auth: localAuth });

  const people = google.people("v1");

  const {
    data: { connections },
  } = await people.people.connections.list({
    personFields:
      "addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined",
    resourceName: "people/me",
    pageSize: 10,
  });

  console.log("\n\nUser's Connections:\n");
  connections?.forEach((c) => console.log(c));
}

console.log("test");
main().catch((err) => {
  console.error(err);
});
