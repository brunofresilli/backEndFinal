document.getElementById('deleteInactiveUsers').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/users/inactive', { method: 'DELETE' });
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        location.reload(); // Refrescar la página para reflejar los cambios
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error deleting inactive users: ' + error.message);
    }
  });