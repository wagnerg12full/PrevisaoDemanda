## Especificações Visuais (UX/Design)

### Inspiração: Interfaces minimalistas como Uber Driver e Waze.

### Mapa Central: Estilo Dark Mode (ou Silver) para destacar as zonas de calor.

### Tecnologia: React Native + TypeScript (TSX).

### Componentes-Chave:

    react-native-maps: Renderização de Circle (Macro) e Heatmap (Micro).

    @react-native-community/slider: Controle deslizante de tempo com otimização onSlidingComplete.

### Zonas de Cluster:

    * Utilizar polígonos convexos (Convex Hull) para marcar as regiões de cada cluster.

    * Cores de Preenchimento:

        1. Vermelho Vibrante: Critico acima do 7.5.

        2. Amarelo/Laranja: Alto acima de 5.0.

        3. Verde/Azul: Até 5.0.

    * Controles:

        Time Slider: Barra deslizante na parte inferior da tela para o usuário ver a "onda" de demanda se movendo ao longo do dia.

        Bottom Sheet: Painel expansível ao tocar em um cluster, mostrando o nome da região e a equipe recomendada.

### Padrões de UI:

    Interação de Zoom: Ao clicar em um marcador na tela de previsão, o sistema dispara a navegação para a tela de detalhes com animação de zoom-in.

    Feedback de Carga: Uso de ActivityIndicator durante a busca de dados analíticos pesados.

    Legenda Dinâmica: Guia visual fixa para interpretação rápida das manchas de calor.