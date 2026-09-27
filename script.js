// Estado global de la aplicación (Simulado)
let appState = {
    currentTableId: null,
    ordersCount: 4030,
    activeOrderTotal: 0,
    cocinaTickets: 1 // Inicialmente tenemos el ticket 4030
};

// ==========================================
// 1. NAVEGACIÓN DEL SIDEBAR
// ==========================================
document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover activo de todos los items
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        // Agregar activo al seleccionado
        e.currentTarget.classList.add('active');

        // Ocultar todas las vistas
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Mostrar la vista seleccionada
        const targetId = e.currentTarget.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'flex';
        }
    });
});

// ==========================================
// 2. LÓGICA DEL MODAL DE COMANDAS
// ==========================================
function openModal(tableId) {
    appState.currentTableId = tableId;
    const modal = document.getElementById('comanda-modal');
    
    // Configurar info del modal
    document.getElementById('modal-title').textContent = `Comanda Mesa ${tableId}`;
    
    // Hora actual
    const now = new Date();
    document.getElementById('modal-time').textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // Limpiar items
    document.getElementById('order-items-list').innerHTML = '';
    appState.activeOrderTotal = 0;
    updateTotal();

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('comanda-modal');
    modal.classList.remove('active');
    appState.currentTableId = null;
}

function addDemoItem() {
    const itemsList = document.getElementById('order-items-list');
    
    const itemHTML = `
        <div class="order-item-row">
            <div class="order-item-info">
                <div class="qty">1</div>
                <div>
                    <strong style="display:block; font-size:15px;">Lomo Saltado</strong>
                    <small style="color:var(--text-muted); font-size:12px;">Término medio</small>
                </div>
            </div>
            <div class="order-item-price">S/25.00</div>
        </div>
    `;
    
    itemsList.insertAdjacentHTML('beforeend', itemHTML);
    appState.activeOrderTotal += 25.00;
    updateTotal();
}

function updateTotal() {
    document.getElementById('modal-total').textContent = `S/${appState.activeOrderTotal.toFixed(2)}`;
}

// ==========================================
// 3. INTERACCIÓN CON COCINA
// ==========================================
function enviarACocina() {
    if (appState.activeOrderTotal === 0) {
        alert("Agrega al menos un producto a la comanda.");
        return;
    }

    appState.ordersCount++;
    const orderId = appState.ordersCount;
    const tableId = appState.currentTableId;
    
    // 1. Agregar Ticket a Cocina
    const kitchenBoard = document.getElementById('kitchen-board');
    const ticketHTML = `
        <div class="kitchen-ticket" id="ticket-${orderId}">
            <div class="ticket-header">
                <div>
                    <h2>Mesa ${tableId}</h2>
                    <p>Orden #${orderId} - Rodrigo N.</p>
                </div>
                <div class="timer"><i class="ph ph-clock"></i> 00:00</div>
            </div>
            <div class="ticket-body">
                <ul class="ticket-items">
                    <li>
                        <span class="qty">1</span>
                        <div class="item-desc">
                            <strong>Lomo Saltado</strong>
                            <small>Término medio</small>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="ticket-footer">
                <button class="btn-success" onclick="marcarListo('${orderId}', '${tableId}')">
                    <i class="ph ph-check-circle"></i> ¡Plato Listo!
                </button>
            </div>
        </div>
    `;
    kitchenBoard.insertAdjacentHTML('beforeend', ticketHTML);

    // 2. Actualizar Estado de Mesa a "En Cocina"
    const mesaCard = document.getElementById(`mesa-${tableId}`);
    if (mesaCard) {
        mesaCard.className = 'table-card'; // Resetea clases (quita free)
        mesaCard.innerHTML = `
            <div class="status-bar animate-pulse-bar" style="background-color: var(--amber);"></div>
            <div class="table-header">
                <div class="table-number">M${tableId}</div>
                <span class="status-tag waiting">
                    <i class="ph ph-cooking-pot animate-bounce-icon"></i> En Cocina
                </span>
            </div>
            <div class="table-info">
                <h3>Orden #${orderId}</h3>
                <p class="warning"><i class="ph ph-clock"></i> Recién ordenado</p>
            </div>
            <div class="table-footer">
                <span class="price">S/${appState.activeOrderTotal.toFixed(2)}</span>
                <span class="action-link">Ver detalle &rarr;</span>
            </div>
        `;
    }

    // 3. Actualizar Historial de Comandas
    const comandasTbody = document.getElementById('comandas-tbody');
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const comandaRow = `
        <tr id="row-comanda-${orderId}">
            <td><strong>#${orderId}</strong></td>
            <td>Mesa ${tableId}</td>
            <td>${timeString}</td>
            <td><span class="status-tag waiting" style="width: fit-content;" id="status-comanda-${orderId}">En Cocina</span></td>
            <td>S/${appState.activeOrderTotal.toFixed(2)}</td>
            <td><button class="btn-text" onclick="openModal('${tableId}')">Ver</button></td>
        </tr>
    `;
    comandasTbody.insertAdjacentHTML('afterbegin', comandaRow);

    // 4. Actualizar Notificación (Badge)
    appState.cocinaTickets++;
    document.getElementById('cocina-badge').textContent = appState.cocinaTickets;
    document.getElementById('cocina-badge').style.display = 'block';

    // Cerrar modal
    closeModal();
}

function marcarListo(orderId, tableId) {
    // 1. Remover ticket de cocina
    const ticket = document.getElementById(`ticket-${orderId}`);
    if (ticket) {
        ticket.remove();
    }

    // 2. Actualizar badge
    appState.cocinaTickets--;
    if (appState.cocinaTickets <= 0) {
        document.getElementById('cocina-badge').style.display = 'none';
        appState.cocinaTickets = 0;
    } else {
        document.getElementById('cocina-badge').textContent = appState.cocinaTickets;
    }

    // 3. Actualizar Mesa a "Comiendo" (Verde)
    const mesaCard = document.getElementById(`mesa-${tableId}`);
    if (mesaCard) {
        // Encontrar barra y tag y actualizarlos
        mesaCard.querySelector('.status-bar').style.backgroundColor = 'var(--green)';
        mesaCard.querySelector('.status-bar').classList.remove('animate-pulse-bar');
        
        const headerInfo = mesaCard.querySelector('.table-header');
        headerInfo.innerHTML = `
            <div class="table-number">M${tableId}</div>
            <span class="status-tag eating">
                <span class="dot"></span> Comiendo
            </span>
        `;
    }

    // 4. Actualizar Historial
    const statusSpan = document.getElementById(`status-comanda-${orderId}`);
    if (statusSpan) {
        statusSpan.className = 'status-tag eating';
        statusSpan.textContent = 'Comiendo';
    }
}
