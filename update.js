const fs = require('fs');

const path = 'customer-frontend/src/pages/MainHomePage.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = \              {[
                { id: 'explore', label: 'Explore', ref: heroRef },
                { id: 'restaurants', label: 'Restaurants', ref: restaurantsRef },
                { id: 'offers', label: 'Offers', ref: offersRef },
                { id: 'app', label: 'App', ref: appRef }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setIsMobileNavOpen(false); scrollToSection(item.ref); }}\;

const replaceStr = \              {[
                { id: 'explore', label: 'Explore', ref: heroRef },
                { id: 'restaurants', label: 'Restaurants', ref: restaurantsRef },
                { id: 'offers', label: 'Offers', ref: offersRef },
                { id: 'app', label: 'App', ref: appRef },
                { id: 'partner', label: 'Partner with us', url: 'https://witty-wave-09eabc200.6.azurestaticapps.net' },
                { id: 'delivery', label: 'Join as Delivery Partner', url: 'https://icy-moss-03c4d1000.6.azurestaticapps.net' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    if (item.url) {
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    } else {
                      scrollToSection(item.ref);
                    }
                  }}\;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Mobile links updated.');
} else {
    console.log('Target string not found.');
}

