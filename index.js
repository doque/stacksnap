/* eslint-disable no-console */

require('dotenv').config();

const download = require('download');
const path = require('path');
const BrowserStack = require('browserstack');

const browsers = require('./browsers.json');
const DIRECTORY = path.join(__dirname, 'screenshots');

const client = BrowserStack.createScreenshotClient({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

const urls = ['https://www.google.com', 'https://www.bing.com'];

console.log(`starting for ${urls.length} URLs`);

urls.forEach(url => {
  client.generateScreenshots(
    {
      url,
      browsers
    },
    (jobError, job) => {
      if (jobError) {
        console.error(jobError);
      } else {
        const { job_id: id, screenshots, wait_time: waitTime } = job;
        const downloadDirectory = path.join(DIRECTORY, id);

        console.info(
          `generating ${screenshots.length} screenshot${
            screenshots.length === 1 ? '' : 's'
          } for ${url} with job_id ${id}`
        );

        const timer = setInterval(() => {
          client.getJob(id, (err, { state, screenshots }) => {
            if (err) {
              console.error(err);
            } else {
              if (state === 'done') {
                screenshots.map(({ image_url }) => {
                  download(image_url, downloadDirectory);
                });

                console.info(
                  `Downloaded screenshots for ${url} to ${path.basename(
                    downloadDirectory
                  )}.`
                );
                clearInterval(timer);
              }
            }
          });
        }, waitTime * 1000);
      }
    }
  );
});
