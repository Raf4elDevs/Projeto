document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const categoriaInicial = params.get("categoria") || 'all';
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Função única responsável por filtrar e animar os cards
    function filtrarReceitas(categoria) {
        const cards = document.querySelectorAll('.recipe-card');
        const filtroAlvo = (categoria || 'all').toLowerCase();

        // 1. Atualiza visualmente o botão ativo
        filterButtons.forEach(btn => {
            const btnFilter = (btn.dataset.filter || '').toLowerCase();
            btn.classList.toggle('active', btnFilter === filtroAlvo);
        });

        // 2. Filtra e anima os cards
        cards.forEach(card => {
            const categoriasCard = (card.dataset.category || '').toLowerCase().split(' ');
            const deveExibir = filtroAlvo === 'all' || categoriasCard.includes(filtroAlvo);

            if (deveExibir) {
                card.classList.remove('hidden');
                
                requestAnimationFrame(() => {
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.classList.add('hidden');
                    }
                }, 300);
            }
        });
    }

    // 3. Event listeners nos botões reutilizando a função
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = button.dataset.filter;
            
            filtrarReceitas(selectedFilter);

            // Atualiza o parâmetro na URL sem recarregar a página
            const newUrl = new URL(window.location);
            if (selectedFilter === 'all') {
                newUrl.searchParams.delete('categoria');
            } else {
                newUrl.searchParams.set('categoria', selectedFilter);
            }
            window.history.replaceState({}, '', newUrl);
        });
    });

    // 4. Executa a filtragem inicial na carga da página
    filtrarReceitas(categoriaInicial);
});