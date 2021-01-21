
export class NewProj{
    public static getNewProjView():string{
        return `<!DOCTYPE html>
        <html>
        <!-- Latest 点击新建项目后的页面 -->
        <head>
          <meta charset="UTF-8">
          <title>Darwin IDE</title>
        </head>
        
        <body>
        
        </body>
        <style>
          @font-face {
            font-family: 'Material Icons';
            font-style: normal;
            font-weight: 400;
            src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.com/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
          }
        
          .material-icons {
            font-family: 'Material Icons';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            text-transform: none;
            display: inline-block;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
          }
        
          body {
          background-color: #E6E6FA;
        }
        </style>
        </html>`;
    }
}