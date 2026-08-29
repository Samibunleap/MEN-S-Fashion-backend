const API_URL = "http://localhost:8080/api";
export const getProducts=async()=> (await fetch(`${API_URL}/products`)).json();
export const addProduct=async(p)=> (await fetch(`${API_URL}/products`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)})).json();
export const updateProduct=async(id,p)=> (await fetch(`${API_URL}/products/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)})).json();
export const deleteProduct=async(id)=> (await fetch(`${API_URL}/products/${id}`,{method:"DELETE"})).json();
