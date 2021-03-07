import "./style.css";
import Logo from './components/Logo'

new Docute({
  target: "#app",
  logo: '<h1 class="itty-logo"><img src="icon.svg" alt="" width="36" height="36" /> <span>Itty Router</span></h1>',
  highlight: ['javascript', 'json'],
  nav: [
    {
      title: 'Home',
      link: '/'
    },
    {
      title: 'GitHub',
      link: 'https://github.com/kwhitley/itty-router',
    }
  ],
  sidebar: [
    {
      title: 'Getting Started',
      link: '/'
    }
  ],
  footer: `© ${new Date().getFullYear()} <a href="https://github.com/kwhitley" target="_blank" rel="noopener noreferrer">
  Kevin Whitley <ExternalLinkIcon /></a>. Released under MIT license.`,
  cssVariables: {
    pageBackground: '#fafafa',
    accentColor: '#ff00ae',
    inlineCodeBackground: '#dbdbdb',
    inlineCodeColor: '#212121',
  }
});
