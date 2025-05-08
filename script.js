const root = document.getElementById("radios-body");
const selectGenero = document.getElementById("tags");

async function fetchData(genero) {
    try {
        const response = await fetch(`https://274a87d7-e30e-48ad-aa9d-dd89d22f9316-00-281xklno63dr3.worf.replit.dev/radios?genero=${genero}`);
        const data = await response.json();

        if (!data || !data.data) return [];

        const enrichedRadios = await Promise.all(
            data.data.map(async (radio) => {
                try {
                    const res = await fetch(`https://274a87d7-e30e-48ad-aa9d-dd89d22f9316-00-281xklno63dr3.worf.replit.dev/radio/${radio.route.params.id}`);
                    const emisora = await res.json();

                    return {
                        id: emisora.streamName,
                        name: radio.title,
                        favicon: radio.logo,
                        url_resolved: emisora?.streamURL ?? null,
                        country: emisora?.country ?? "Desconocido",
                    };
                } catch (error) {
                    console.error(`Error al obtener emisora ${radio.id}:`, error);
                    return null;
                }
            })
        );

        return enrichedRadios.filter(r => r !== null).sort((a, b) => a.country.localeCompare(b.country));
    } catch (error) {
        console.error('Error en fetchRadios:', error);
        return [];
    }
}

const tableData = (radio) => `
    <tr onclick="reproducirRadio('${radio.url_resolved}', this)">
        <td><img src="${radio.favicon}" alt="${radio.name}" width="32"></td>
        <td>${radio.name}</td>
        <td>${radio.country}</td>
    </tr>
`;

const showResults = (items) => {
    if (items.length > 0) {
        root.innerHTML = items.map(tableData).join('');
    } else {
        root.innerHTML = "<tr><td colspan='3'>No se encontraron resultados</td></tr>";
    }
};
window.reproducirRadio = (url, trElement) => {
    const player = document.getElementById("audio-player");
    if (player) {
        player.src = url;
        player.play().catch(err => {
            console.error("Error al reproducir la radio:", err);
        });
    }

    // Quitar la clase 'selected' de todas las filas
    document.querySelectorAll("#radios tbody tr").forEach(tr => {
        tr.classList.remove("selected");
    });

    // Agregar la clase solo a la fila seleccionada
    trElement.classList.add("selected");
};


const init = async () => {
    const genero = selectGenero.value;
    const data = await fetchData(genero);
    showResults(data);
};

selectGenero.addEventListener("change", init);
window.addEventListener("DOMContentLoaded", init);


