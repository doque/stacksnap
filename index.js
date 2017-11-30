/* eslint-disable no-console */

require('dotenv').config();

const download = require('download');
const path = require('path');
const BrowserStack = require('browserstack');
const { Spinner } = require('cli-spinner');
const browsers = require('./browsers.json');

const DIRECTORY = path.join(__dirname, 'screenshots');

const client = BrowserStack.createScreenshotClient({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

client.generateScreenshots(
  {
    url: 'https://www.google.com',
    browsers
  },
  (jobError, job) => {
    if (jobError) {
      console.error(jobError);
    } else {
      const { job_id: id, screenshots, wait_time: waitTime } = job;
      console.info(
        `generating ${screenshots.length} screenshots with job_id ${id}`
      );

      const spinner = new Spinner('%s waiting for browserstack')
        .setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏')
        .start();

      const timer = setInterval(() => {
        client.getJob(id, (err, { state, screenshots }) => {
          if (err) {
            console.error(err);
          } else {
            if (state === 'done') {
              const downloadDirectory = path.join(DIRECTORY, id);

              screenshots.map(({ image_url }) => {
                download(image_url, downloadDirectory);
              });

              spinner.stop(true);
              console.info(
                `Download to \`${path.basename(downloadDirectory)}\` complete.`
              );
              clearInterval(timer);
            }
          }
        });
      }, waitTime * 1000);
    }
  }
);
