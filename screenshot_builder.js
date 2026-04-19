const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    // The logo uses "../icon.png", so we should map that too
    let filePath = path.join(__dirname, 'dist', 'js', reqUrl);
    if (reqUrl.includes('icon.png')) {
        filePath = path.join(__dirname, 'icon.png');
    }
    
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png'
    };
    
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
});

server.listen(0, async () => {
    const port = server.address().port;
    const iframeUrl = "http://localhost:" + port + "/index.html";
    console.log("Server listening at", iframeUrl);
    
    const browser = await puppeteer.launch();
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    
    let startH = currentH - 4;
    let leaveH = currentH + 4;
    if (startH < 0) startH = 0;
    
    const screenshots = [
        { 
            id: 1, 
            title: "Track Your Work Hours Effortlessly", 
            subtitle: "Stay on top of your schedule and manage your most valuable asset.", 
            bg: "#f8fafc",
            mock: {}
        },
        { 
            id: 2, 
            title: "Personalize Your Extension", 
            subtitle: "Choose from 20 gorgeous pastel colors to match your mood.", 
            bg: "#fce7f3",
            clickSettings: true,
            mock: { uiData: { select_color: "#fce7f3" } }
        },
        { 
            id: 3, 
            title: "Start Working Immediately", 
            subtitle: "One click to quickly apply presets or start your session.", 
            bg: "#e0f2fe",
            mock: {}
        },
        { 
            id: 4, 
            title: "Set Firm Leave Targets", 
            subtitle: "Know exactly when it's time to log off with the live progress tracker.", 
            bg: "#f3e8ff",
            mock: {
                time_calc_data: {
                    is_calculation_started: true,
                    start_time: { $H: startH, $m: currentM },
                    working_time: { $H: 8, $m: 0 },
                    break_time: { $H: 1, $m: 0 },
                    leave_time: { $H: leaveH, $m: currentM }
                },
                uiData: { select_color: "#e8f4fc" }
            }
        },
        { 
            id: 5, 
            title: "Detailed & Compact Views", 
            subtitle: "View your progress with a clean and minimal layout.", 
            bg: "#ecfdf5",
            mock: {
                time_calc_data: {
                    is_calculation_started: true,
                    start_time: { $H: startH, $m: currentM },
                    working_time: { $H: 8, $m: 0 },
                    break_time: { $H: 0, $m: 30 }
                },
                uiData: { compactPanels: false, select_color: "#a7f3d0" }
            }
        }
    ];

    for (const s of screenshots) {
        const page = await browser.newPage();
        page.on('console', msg => console.log('LOG:', msg.text()));
        page.on('pageerror', err => console.log('ERR:', err.toString()));
        await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
        
        await page.evaluateOnNewDocument((mock) => {
            window.mockData = mock || {};
            window.chrome = {
                storage: {
                    sync: {
                        get: async () => window.mockData,
                        set: async (data) => { Object.assign(window.mockData, data); return {}; }
                    }
                },
                alarms: {
                    create: () => {},
                    clear: () => {}
                }
            };
        }, s.mock);
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
                margin: 0; padding: 0; width: 1280px; height: 800px; 
                display: flex; flex-direction: column; align-items: center; 
                font-family: 'Inter', sans-serif; 
                background: ${s.bg};
                overflow: hidden;
            }
            #title { margin-top: 60px; font-size: 56px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.02em; }
            #subtitle { margin-top: 15px; font-size: 26px; color: #475569; text-align: center; max-width: 900px; font-weight: 400; opacity: 0.9; }
            #container { display:flex; flex:1; align-items: flex-start; justify-content: center; margin-top: -30px; position:relative; z-index: 10; padding-top: 70px; }
            #extension-frame { 
                width: 400px; 
                height: 520px; 
                border: none; 
                border-radius: 14px; 
                box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.3), 0 20px 30px -10px rgba(0, 0, 0, 0.15); 
                background: #fff; 
                overflow: hidden;
                border: 1px solid rgba(0,0,0,0.08);
            }
          </style>
        </head>
        <body>
          <div id="title">${s.title}</div>
          <div id="subtitle">${s.subtitle}</div>
          <div id="container">
            <iframe id="extension-frame" src="${iframeUrl}"></iframe>
          </div>
        </body>
        </html>
        `;
        
        await page.setContent(html);
        await new Promise(r => setTimeout(r, 2000));
        
        if (s.clickSettings) {
            const frame = page.frames().find(f => f.url().includes('index.html'));
            if (frame) {
                try {
                    await frame.click('.settings-collapse .ant-collapse-header');
                    await new Promise(r => setTimeout(r, 600)); 
                } catch(e) { console.error("Could not click settings"); }
            }
        }
        
        const outPath = path.join(__dirname, 'webstore_update', 'screenshot_' + s.id + '.png');
        await page.screenshot({ path: outPath });
        console.log("Saved " + outPath);
        await page.close();
    }
    await browser.close();
    server.close();
});
