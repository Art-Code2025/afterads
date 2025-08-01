// Reset wishlist count to 0 for testing purposes
// This script can be run in the browser console

(function() {
    // Clear all wishlist-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('wishlist') || key.includes('Wishlist'))) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('Removed:', key);
    });
    
    // Reset wishlist count to 0
    localStorage.setItem('lastWishlistCount', '0');
    
    // Check for logged in user
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user?.id) {
                localStorage.setItem(`wishlistCount_${user.id}`, '0');
                console.log('Reset wishlist count for user:', user.id);
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    
    console.log('✅ Wishlist count reset to 0');
    console.log('Current wishlist count in localStorage:', localStorage.getItem('lastWishlistCount'));
    
    // Reload the page to see the changes
    location.reload();
})();