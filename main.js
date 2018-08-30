const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    //create new window
    mainWindow = new BrowserWindow({});
    //load HTML file into window
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true
    })); //file://dirname/mainWindow.html

    //quit app when closed
    mainWindow.on('closed', function(){
      app.quit();
    });

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert Menu
    Menu.setApplicationMenu(mainMenu);

});

//handle create add window
function createAddWindow(){
  //create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });
  //load HTML file into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  })); //file://dirname/mainWindow.html
  //garbage collection handle
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// catch item:add
ipcMain.on('item:add', function(e, item){
  // console.log(item); //check that the item gets over here
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});
// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Clear Items'
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'command+Q' :
        'ctrl+Q',
        click(){
          app.quit();
        }
      }

    ]
  }
];

// if mac, add empty object to menu to show "FILE"
if (process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// add developer tools item if not in production
if(process.env.node_env != 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        //adding focusedWindow so it appears on small windows too
        accelerator: process.platform === 'darwin' ? 'command+I' :
        'ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
