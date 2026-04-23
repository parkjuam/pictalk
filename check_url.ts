import https from 'https';

const url = 'https://drive.google.com/file/d/1FqbnWoojkg0lpsyvvCwvZgoOtmNJwsu6/view?usp=sharing';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const match = data.match(/<title>(.*?)<\/title>/);
        console.log("Title of GDrive link:", match ? match[1] : "Not found");
    });
}).on('error', (err) => {
    console.log("Error:", err.message);
});
