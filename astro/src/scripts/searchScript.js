document.addEventListener('DOMContentLoaded', function () {
  fetch('/search-index.json')
    .then(response => response.json())
    .then(items => {
      const options = {
        keys: [
          {
            name: 'title',
            weight: 0.7
          }, {
            name: 'description',
            weight: 0.3
          }
        ],
        threshold: 0.5,
        distance: 80,
        minMatchCharLength: 3
      };

      const fuse = new Fuse(items, options);

      const searchInput = document.getElementById('search-box');
      const searchResults = document.getElementById('search-result-list');
      const resultsCount = document.getElementById('results-count');
      const resultDetails = document.getElementById('result-details');

      searchInput.addEventListener('input', function () {
        const query = searchInput.value;
        const results = fuse.search(query);

        if (results.length > 0 ) {
          searchInput.setAttribute('aria-expanded','true');
          searchResults.style.display = 'block';
          resultsCount.style.display = 'block';
          resultsCount.innerHTML = `${results.length} results found for \<em>${query}\</em>`;
        } else {
          searchInput.setAttribute('aria-expanded','false');
          searchResults.style.display = 'none';
          resultsCount.style.display = 'none';
          resultsCount.innerHTML = ''
        }

        resultDetails.innerHTML = '';
        results.forEach(result => {
          const li = document.createElement('li');
          li.innerHTML = `<h3>
                            <a href="/${result.item.type}/${result.item.slug}" tabindex="0">${result.item.title}</a>
                            <span>${result.item.type}</span>
                          </h3>
                          <span>${result.item.description}</span>`;
          resultDetails.appendChild(li);
        });
      });
    });
});