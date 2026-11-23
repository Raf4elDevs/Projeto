package com.tcc.bitebyte.service;

import com.tcc.bitebyte.dto.ReceitaDTO;
import com.tcc.bitebyte.entity.Receita;
import com.tcc.bitebyte.repository.ReceitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ReceitaService {

    @Autowired
    private ReceitaRepository repository;

    public List<Receita> listarTodas() {
        return repository.findAll();
    }

    public List<Receita> buscar(String termo) {

        if (termo == null || termo.trim().isEmpty()) {
            return repository.findAll();
        }

        return repository.findByTituloContainingIgnoreCase(termo);
    }

    // ============================================================
    // BUSCA PARA O CHEFBOT (usada pela IA como base de referência)
    // ============================================================

    private static final Set<String> STOPWORDS_BUSCA = new HashSet<>(Arrays.asList(
            "uma", "uns", "umas", "das", "dos", "nos", "nas", "por", "para", "com", "sem",
            "que", "como", "qual", "quais", "voce", "voces", "ele", "ela", "isso", "essa",
            "esse", "esta", "este", "aqui", "tem", "ter", "mais", "muito", "pouco",
            "quero", "queria", "gostaria", "preciso", "posso", "pode", "podem", "vou",
            "vamos", "bora", "fazer", "faco", "preparar", "preparo", "cozinhar",
            "receita", "receitas", "ensina", "ensine", "passa", "passe", "manda", "mande",
            "mostra", "mostre", "sugestao", "sugestoes", "sugira", "ideia", "ideias",
            "opcao", "opcoes", "algo", "alguma", "coisa", "dica", "dicas", "ola", "por favor",
            "favor", "sobre", "quanto", "quantos", "quantas", "quando", "onde", "porque",
            "trocar", "substituir", "usar", "ficar", "fica", "deixar", "da", "de", "do"
    ));

    private static final Pattern PADRAO_TEMPO = Pattern.compile("(\\d+)\\s*(h|hora|horas|min|m|minuto|minutos)?");

    private static String normalizar(String texto) {
        if (texto == null) return "";
        String n = Normalizer.normalize(texto.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        return n.replaceAll("\\p{M}", "").trim();
    }

    /** Remove plural simples para "ovos" casar com "ovo", "limões" com "limão". */
    private static String radical(String palavra) {
        if (palavra.length() > 4 && palavra.endsWith("oes")) {
            return palavra.substring(0, palavra.length() - 3) + "ao";
        }
        if (palavra.length() > 3 && palavra.endsWith("s")) {
            return palavra.substring(0, palavra.length() - 1);
        }
        return palavra;
    }

    private static Set<String> palavrasDe(String texto) {
        Set<String> palavras = new HashSet<>();
        for (String p : normalizar(texto).split("[^a-z0-9]+")) {
            if (p.length() >= 2) palavras.add(radical(p));
        }
        return palavras;
    }

    private static List<String> termosDaConsulta(String consulta) {
        List<String> termos = new ArrayList<>();
        for (String p : normalizar(consulta).split("[^a-z0-9]+")) {
            if (p.length() < 3 || STOPWORDS_BUSCA.contains(p)) continue;
            String r = radical(p);
            if (!termos.contains(r)) termos.add(r);
        }
        return termos;
    }

    private static boolean campoContem(Set<String> palavrasDoCampo, String termo) {
        if (palavrasDoCampo.contains(termo)) return true;
        if (termo.length() >= 5) {
            for (String palavra : palavrasDoCampo) {
                if (palavra.startsWith(termo)) return true;
            }
        }
        return false;
    }

    /** Converte "45 min", "1h30", "2 horas" em minutos. Retorna null se não entender. */
    private static Integer tempoEmMinutos(String tempo) {
        if (tempo == null || tempo.isBlank()) return null;
        String t = normalizar(tempo);
        Matcher m = PADRAO_TEMPO.matcher(t);
        int total = 0;
        boolean achou = false;
        while (m.find()) {
            int valor = Integer.parseInt(m.group(1));
            String unidade = m.group(2);
            boolean hora = unidade != null && unidade.startsWith("h");
            total += hora ? valor * 60 : valor;
            achou = true;
        }
        return achou ? total : null;
    }

    private static double pontuar(Receita r, List<String> termos, String consultaNormalizada) {
        if (termos.isEmpty()) return 0;

        Set<String> titulo = palavrasDe(r.getTitulo());
        Set<String> categoria = palavrasDe(r.getCategoria());
        Set<String> ingredientes = palavrasDe(r.getIngredientes());
        Set<String> resumo = palavrasDe(r.getResumo());

        double score = 0;
        for (String termo : termos) {
            if (campoContem(titulo, termo)) score += 5;
            else if (campoContem(categoria, termo)) score += 3;
            else if (campoContem(ingredientes, termo)) score += 2;
            else if (campoContem(resumo, termo)) score += 1;
        }

        // Bônus quando o título inteiro aparece na consulta ("bolo de cenoura" em "receita de bolo de cenoura").
        String tituloNormal = normalizar(r.getTitulo());
        if (!tituloNormal.isEmpty() && consultaNormalizada.contains(tituloNormal)) score += 6;

        return score;
    }

    /**
     * Busca receitas para o ChefBot. Ordena por relevância (título > categoria > ingredientes > resumo).
     * Sem termos úteis na consulta (ex.: "me dê uma sugestão"), devolve receitas filtradas apenas
     * por categoria/dificuldade/tempo.
     */
    public List<Receita> buscarParaChefbot(
            String q,
            Integer limite,
            String categoria,
            String dificuldade,
            Integer tempoMaximo
    ) {
        int max = (limite == null || limite < 1) ? 20 : Math.min(limite, 100);
        List<String> termos = termosDaConsulta(q);
        String consultaNormalizada = normalizar(q);
        String categoriaFiltro = normalizar(categoria);
        String dificuldadeFiltro = normalizar(dificuldade);

        List<Map.Entry<Receita, Double>> pontuadas = new ArrayList<>();

        for (Receita r : repository.findAll()) {
            if (!categoriaFiltro.isEmpty() && !normalizar(r.getCategoria()).contains(categoriaFiltro)) continue;
            if (!dificuldadeFiltro.isEmpty() && !normalizar(r.getDificuldade()).contains(dificuldadeFiltro)) continue;

            if (tempoMaximo != null) {
                Integer minutos = tempoEmMinutos(r.getTempo());
                if (minutos != null && minutos > tempoMaximo) continue;
            }

            double score = pontuar(r, termos, consultaNormalizada);
            if (!termos.isEmpty() && score <= 0) continue;

            pontuadas.add(new AbstractMap.SimpleEntry<>(r, score));
        }

        pontuadas.sort((a, b) -> {
            int cmp = Double.compare(b.getValue(), a.getValue());
            if (cmp != 0) return cmp;
            return normalizar(a.getKey().getTitulo()).compareTo(normalizar(b.getKey().getTitulo()));
        });

        List<Receita> resultado = new ArrayList<>();
        for (Map.Entry<Receita, Double> e : pontuadas) {
            resultado.add(e.getKey());
            if (resultado.size() >= max) break;
        }
        return resultado;
    }

    public Receita buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Receita não encontrada"));
    }

    public Receita criar(ReceitaDTO dto) {

        Receita receita = new Receita();

        receita.setTitulo(dto.getTitulo());
        receita.setCategoria(dto.getCategoria());
        receita.setTempo(dto.getTempo());
        receita.setDificuldade(dto.getDificuldade());
        receita.setImagem(dto.getImagem());
        receita.setResumo(dto.getResumo());
        receita.setIngredientes(dto.getIngredientes());
        receita.setPassos(dto.getPassos());

        return repository.save(receita);
    }

    public Receita atualizar(Long id, ReceitaDTO dto) {

        Receita receita = buscarPorId(id);

        receita.setTitulo(dto.getTitulo());
        receita.setCategoria(dto.getCategoria());
        receita.setTempo(dto.getTempo());
        receita.setDificuldade(dto.getDificuldade());
        receita.setImagem(dto.getImagem());
        receita.setResumo(dto.getResumo());
        receita.setIngredientes(dto.getIngredientes());
        receita.setPassos(dto.getPassos());

        return repository.save(receita);
    }

    public void excluir(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Receita não encontrada");
        }

        repository.deleteById(id);
    }
}