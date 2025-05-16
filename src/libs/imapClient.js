import { simpleParser } from 'mailparser';
import Imap from 'node-imap';

export function connectToImap() {
    return new Imap({
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true,
    });
}



export function fetchUnreadEmails() {
    return new Promise((resolve, reject) => {
        const imap = connectToImap();

        imap.once('ready', () => {
            console.log('IMAP connection ready');
            imap.openBox('INBOX', true, (err, box) => {
                if (err) return reject(err);

                imap.search([
                    'UNSEEN',
                    ['HEADER', 'SUBJECT', 'Nivesh']
                ], (err, results) => {
                    if (err || !results.length) {
                        imap.end();
                        return resolve([]);
                    }

                    const f = imap.fetch(results, { bodies: '' });
                    const parsePromises = [];

                    f.on('message', msg => {
                        msg.on('body', stream => {
                            const parsePromise = simpleParser(stream)
                                .then(parsed => {
                                    const subject = parsed.subject?.toLowerCase();
                                    if (subject && (subject.includes('nivesh jano') || subject.includes('nivesh') || subject.includes('jano'))) {
                                        return parsed;
                                    }
                                    return null;
                                })
                                .catch(err => null);
                            parsePromises.push(parsePromise);
                        });
                    });

                    f.once('end', async () => {
                        console.log('Fetch complete');
                        const emails = await Promise.all(parsePromises);
                        imap.end();
                        resolve(emails.filter(Boolean)); // filter out failed parses
                    });
                });
            });
        });

        imap.once('error', err => reject(err));
        imap.connect();
    });
}