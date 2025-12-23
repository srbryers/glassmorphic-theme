var m=Object.defineProperty;var v=(n,e,t)=>e in n?m(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var s=(n,e,t)=>v(n,typeof e!="symbol"?e+"":e,t);class g{constructor(){s(this,"baseUrl","/cart")}async get(){const e=await fetch(`${this.baseUrl}.js`);if(!e.ok)throw new Error("Failed to fetch cart");const t=await e.json();return this.dispatchUpdate(t),t}async add(e){const t=Array.isArray(e)?e:[e],a=await fetch(`${this.baseUrl}/add.js`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:t})});if(!a.ok){const o=await a.json();throw new Error(o.description||"Failed to add to cart")}const i=await a.json();return await this.get(),this.dispatch("cart:item-added",{items:i.items||[i]}),i.items||i}async update(e,t){const a=await fetch(`${this.baseUrl}/change.js`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,quantity:t})});if(!a.ok)throw new Error("Failed to update cart");const i=await a.json();return this.dispatchUpdate(i),t===0?this.dispatch("cart:item-removed",{key:e}):this.dispatch("cart:item-updated",{key:e,quantity:t}),i}async remove(e){return this.update(e,0)}async clear(){const e=await fetch(`${this.baseUrl}/clear.js`,{method:"POST",headers:{"Content-Type":"application/json"}});if(!e.ok)throw new Error("Failed to clear cart");const t=await e.json();return this.dispatchUpdate(t),this.dispatch("cart:cleared",{}),t}async updateNote(e){const t=await fetch(`${this.baseUrl}/update.js`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:e})});if(!t.ok)throw new Error("Failed to update cart note");const a=await t.json();return this.dispatchUpdate(a),a}async updateAttributes(e){const t=await fetch(`${this.baseUrl}/update.js`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({attributes:e})});if(!t.ok)throw new Error("Failed to update cart attributes");const a=await t.json();return this.dispatchUpdate(a),a}formatMoney(e,t="USD"){return new Intl.NumberFormat("en-US",{style:"currency",currency:t}).format(e/100)}dispatchUpdate(e){this.dispatch("cart:updated",{cart:e})}dispatch(e,t){document.dispatchEvent(new CustomEvent(e,{detail:t}))}}const r=new g;class w{constructor(){s(this,"cart",null);s(this,"listeners",new Set);s(this,"loading",!1);s(this,"initialized",!1)}async init(){if(this.initialized&&this.cart)return this.cart;this.loading=!0,this.notify();try{return this.cart=await r.get(),this.initialized=!0,this.setupEventListeners(),this.cart}finally{this.loading=!1,this.notify()}}getCart(){return this.cart}getItemCount(){var e;return((e=this.cart)==null?void 0:e.item_count)??0}getTotalPrice(){var e;return((e=this.cart)==null?void 0:e.total_price)??0}getFormattedTotal(){return r.formatMoney(this.getTotalPrice())}isLoading(){return this.loading}isEmpty(){return this.getItemCount()===0}findItem(e){var t;return(t=this.cart)==null?void 0:t.items.find(a=>a.variant_id===e)}findItemByKey(e){var t;return(t=this.cart)==null?void 0:t.items.find(a=>a.key===e)}async addItem(e,t=1){this.loading=!0,this.notify();try{await r.add({id:e,quantity:t}),this.cart=await r.get()}finally{this.loading=!1,this.notify()}}async updateItem(e,t){this.loading=!0,this.notify();try{this.cart=await r.update(e,t)}finally{this.loading=!1,this.notify()}}async removeItem(e){await this.updateItem(e,0)}async clear(){this.loading=!0,this.notify();try{this.cart=await r.clear()}finally{this.loading=!1,this.notify()}}subscribe(e){return this.listeners.add(e),this.cart&&e(this.cart),()=>{this.listeners.delete(e)}}notify(){this.cart&&this.listeners.forEach(e=>e(this.cart))}setupEventListeners(){document.addEventListener("cart:updated",(e=>{this.cart=e.detail.cart,this.notify()})),document.addEventListener("cart:add",(async e=>{const{id:t,quantity:a}=e.detail;await this.addItem(t,a)})),document.addEventListener("cart:refresh",async()=>{this.cart=await r.get(),this.notify()})}}const c=new w;class f extends HTMLElement{constructor(){super(...arguments);s(this,"drawer",null);s(this,"overlay",null);s(this,"closeBtn",null);s(this,"cartItems",null);s(this,"cartCount",null);s(this,"cartTotal",null);s(this,"emptyState",null);s(this,"isOpen",!1);s(this,"unsubscribe",null);s(this,"handleKeydown",t=>{t.key==="Escape"&&this.isOpen&&this.close()})}connectedCallback(){console.log("[Island] cart-drawer hydrated (client:idle)"),this.drawer=this.querySelector("[data-drawer]"),this.overlay=this.querySelector("[data-overlay]"),this.closeBtn=this.querySelector("[data-close]"),this.cartItems=this.querySelector("[data-cart-items]"),this.cartCount=this.querySelector("[data-cart-count]"),this.cartTotal=this.querySelector("[data-cart-total]"),this.emptyState=this.querySelector("[data-empty-state]"),this.setupEventListeners(),this.setupCartTriggers(),this.subscribeToCart(),this.setAttribute("data-hydrated","true")}disconnectedCallback(){var t;document.removeEventListener("keydown",this.handleKeydown),(t=this.unsubscribe)==null||t.call(this)}setupEventListeners(){var t,a,i;(t=this.closeBtn)==null||t.addEventListener("click",()=>this.close()),(a=this.overlay)==null||a.addEventListener("click",()=>this.close()),this.handleKeydown=this.handleKeydown.bind(this),document.addEventListener("keydown",this.handleKeydown),(i=this.cartItems)==null||i.addEventListener("click",async o=>{const h=o.target,y=h.closest("[data-remove]"),u=h.closest("[data-increment]"),p=h.closest("[data-decrement]");if(y){const d=y.getAttribute("data-key");d&&await c.removeItem(d)}if(u){const d=u.getAttribute("data-key"),l=parseInt(u.getAttribute("data-quantity")||"1");d&&await c.updateItem(d,l+1)}if(p){const d=p.getAttribute("data-key"),l=parseInt(p.getAttribute("data-quantity")||"1");d&&l>1&&await c.updateItem(d,l-1)}})}setupCartTriggers(){document.addEventListener("click",t=>{t.target.closest("[data-cart-trigger]")&&(t.preventDefault(),this.open())}),document.addEventListener("cart:open",()=>{this.open()}),document.addEventListener("cart:add",(async t=>{const{id:a,quantity:i}=t.detail;await c.addItem(a,i),this.open()}))}subscribeToCart(){c.init().then(t=>{this.renderCart(t)}),this.unsubscribe=c.subscribe(t=>{this.renderCart(t)})}open(){if(!this.drawer||!this.overlay)return;this.isOpen=!0,this.classList.remove("hidden"),this.drawer.classList.remove("translate-x-full"),this.overlay.classList.remove("hidden","opacity-0"),document.body.style.overflow="hidden";const t=this.drawer.querySelector("button, a, input");t==null||t.focus(),this.dispatchEvent(new CustomEvent("cart:opened",{bubbles:!0}))}close(){!this.drawer||!this.overlay||(this.isOpen=!1,this.drawer.classList.add("translate-x-full"),this.overlay.classList.add("opacity-0"),document.body.style.overflow="",setTimeout(()=>{var t;(t=this.overlay)==null||t.classList.add("hidden"),this.classList.add("hidden")},300),this.dispatchEvent(new CustomEvent("cart:closed",{bubbles:!0})))}renderCart(t){var a,i;this.cartCount&&(this.cartCount.textContent=t.item_count.toString(),this.cartCount.classList.toggle("hidden",t.item_count===0)),document.querySelectorAll("[data-cart-count]").forEach(o=>{o.textContent=t.item_count.toString(),o.classList.toggle("hidden",t.item_count===0)}),this.cartTotal&&(this.cartTotal.textContent=r.formatMoney(t.total_price)),this.emptyState&&this.emptyState.classList.toggle("hidden",t.items.length>0),this.cartItems&&(t.items.length===0?this.cartItems.innerHTML="":this.cartItems.innerHTML=t.items.map(o=>this.renderCartItem(o)).join("")),c.isLoading()?(a=this.drawer)==null||a.classList.add("cart-loading"):(i=this.drawer)==null||i.classList.remove("cart-loading")}renderCartItem(t){const a=t.image?this.getOptimizedImage(t.image,160):"";return`
      <div class="flex gap-4 py-4 border-b border-[var(--border)]" data-line-item="${t.key}">
        ${a?`
          <a href="${t.url}" class="flex-shrink-0 w-20 h-20 bg-[var(--muted)] rounded-lg overflow-hidden">
            <img src="${a}" alt="${t.title}" class="w-full h-full object-cover" loading="lazy">
          </a>
        `:""}
        <div class="flex-1 min-w-0">
          <a href="${t.url}" class="font-medium text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-2">
            ${t.title}
          </a>
          ${t.variant_title&&t.variant_title!=="Default Title"?`
            <p class="text-sm text-[var(--muted-foreground)]">${t.variant_title}</p>
          `:""}
          ${this.renderItemDiscounts(t)}
          <div class="flex items-center gap-3 mt-2">
            <div class="quantity-selector">
              <button
                type="button"
                data-decrement
                data-key="${t.key}"
                data-quantity="${t.quantity}"
                aria-label="Decrease quantity"
                ${t.quantity<=1?"disabled":""}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <span class="quantity-selector__value">${t.quantity}</span>
              <button
                type="button"
                data-increment
                data-key="${t.key}"
                data-quantity="${t.quantity}"
                aria-label="Increase quantity"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            ${this.renderItemPrice(t)}
          </div>
        </div>
        <button
          type="button"
          data-remove
          data-key="${t.key}"
          class="self-start p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
          aria-label="Remove ${t.title}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `}renderItemPrice(t){return t.final_line_price<t.line_price?`
        <div class="flex flex-col items-end">
          <span class="price price-sale">${r.formatMoney(t.final_line_price)}</span>
          <span class="price-compare text-xs">${r.formatMoney(t.line_price)}</span>
        </div>
      `:`<span class="price">${r.formatMoney(t.final_line_price)}</span>`}renderItemDiscounts(t){return!t.discounts||t.discounts.length===0?"":`
      <div class="flex flex-wrap gap-1 mt-1">
        ${t.discounts.map(a=>`
          <span class="inline-flex items-center gap-1 text-xs text-[var(--primary)]">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            ${a.title}
          </span>
        `).join("")}
      </div>
    `}getOptimizedImage(t,a){return t.includes("cdn.shopify.com")?t.replace(/(_\d+x\d+)?(\.[^.]+)$/,`_${a}x$2`):t}}customElements.define("cart-drawer",f);const k=Object.freeze(Object.defineProperty({__proto__:null,CartDrawer:f},Symbol.toStringTag,{value:"Module"}));export{r as a,k as b,c};
