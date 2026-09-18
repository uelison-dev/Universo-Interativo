import { celestialData } from '../src/data/celestial_data.js';
import { tnoData } from '../src/data/tno_data.js';
import { cometData } from '../src/data/comet_data.js';
import { moonData } from '../src/data/moon_data.js';
import { majorTNOData } from '../src/data/major_tnos_data.js';
// NOVO IMPORT: Dados dos Buracos Negros
import { blackHoleData } from '../src/data/black_hole_data.js';

export function initSearch(selectObject) {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.getElementById('search-container');

    // Unifica e normaliza todos os objetos pesquisáveis
    const searchableObjects = [
        ...celestialData.map(item => ({
            name: item.name,
            type: item.name === 'Sol' ? 'Estrela' : 'Planeta',
            objectData: item
        })),
        ...moonData.map(item => ({
            name: item.name,
            type: 'Lua',
            objectData: item
        })),
        ...tnoData.map(item => ({
            name: item.Nome || item['Designação provisória'],
            type: 'TNO',
            number: item['Número'],
            objectData: item
        })),
        ...cometData.map(item => ({
            name: item.name,
            type: 'Cometa',
            number: item['Número'],
            objectData: item
        })),
        // Novos objetos a serem incluídos na pesquisa
        ...majorTNOData.flatMap(tno => {
            const list = [{
                name: tno.name,
                type: 'Planeta-anão',
                objectData: tno
            }];
            if (tno.satellites) {
                tno.satellites.forEach(satellite => {
                    list.push({
                        name: satellite.name,
                        type: 'Lua',
                        objectData: satellite
                    });
                });
            }
            return list;
        }),
        // NOVO: Adiciona os Buracos Negros à lista de pesquisa
        ...blackHoleData.map(item => ({
            name: item.name,
            type: 'Buraco Negro',
            objectData: item
        }))
    ];

    function normalize(text) {
        if (text === null || text === undefined) return '';
        return String(text).toLowerCase().replace(/\s+/g, '');
    }
// ... (restante do código da função initSearch)
    function updateSearchResults(query) {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';
        const normalizedQuery = normalize(query);

        if (!normalizedQuery) {
            searchResults.classList.remove('visible');
            return;
        }

        const filtered = searchableObjects.filter(obj =>
            normalize(obj.name).includes(normalizedQuery) ||
            (obj.number && normalize(obj.number).includes(normalizedQuery))
        );

        if (filtered.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'Nenhum resultado encontrado.';
            noResultsItem.classList.add('no-results');
            searchResults.appendChild(noResultsItem);
            searchResults.classList.add('visible');
            return;
        }

        if (filtered.length > 0) {
            // Cria e adiciona o item de cabeçalho
            const headerItem = document.createElement('li');
            headerItem.innerHTML = '<span>Identificação</span><span class="separator">|</span><span>Tipo</span>';
            headerItem.classList.add('header-row');
            searchResults.appendChild(headerItem);
        }

        filtered.forEach(result => {
            const li = document.createElement('li');

            // Cria e adiciona os spans para cada coluna
            const nameSpan = document.createElement('span');
            nameSpan.textContent = result.name;

            const separatorSpan = document.createElement('span');
            separatorSpan.textContent = '|';
            separatorSpan.classList.add('separator');

            const typeSpan = document.createElement('span');
            typeSpan.textContent = result.type;

            li.appendChild(nameSpan);
            li.appendChild(separatorSpan);
            li.appendChild(typeSpan);

            li.setAttribute('data-name', result.name);
            searchResults.appendChild(li);
        });

        searchResults.classList.add('visible');
    }

    searchInput.addEventListener('input', () => {
        const rawQuery = searchInput.value;
        updateSearchResults(rawQuery);
    });

    searchResults.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (!li || li.classList.contains('no-results')) return;

        const nameToFind = li.getAttribute('data-name');

        selectObject(nameToFind);

        searchResults.classList.remove('visible');
        searchInput.value = '';
    });

    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) {
            searchResults.classList.remove('visible');
        }
    });
}