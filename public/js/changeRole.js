async function changeUserRole(userId, currentRole) {
    
    const newRole = currentRole === 'user' ? 'premium' : 'user';

    try {
        const response = await fetch(`/api/users/premium/${userId}`, { 
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole }) 
        });

        
        if (response.ok) {
            const result = await response.json();
            alert('User role updated successfully');
            location.reload(); 
        } else {
           
            const result = await response.json();
            alert(result.message || 'Failed to update user role');
        }
    } catch (error) {
        
        console.error('Error al actualizar el rol del usuario:', error);
        alert('An error occurred while updating user role');
    }
}