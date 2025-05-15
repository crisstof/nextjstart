'use client';
import {useEffect, useState} from "react";
import Image from "next/image";
import styles from "./todolist.module.css";


export default function Todolist() {
    const [newTask, setNewTask] = useState(''); //déclare un état pour la nouvelle tâche et 2 attributs pour
    //récupérer la valeur de l'input et écrire dans le champ input
//etat pour ajouter la liste des tâches
const [tasks, setTasks] = useState<string[]>([]);
let addTask = ()=> {
if(newTask !== ''){
setTasks([...tasks, newTask]);
setNewTask('');
}
}
//supprimer une tâche
let deleteTask = (index:number) => {
let updateTask = [...tasks];
updateTask.splice(index, 1);//modifer le contenu d'un tableau (supp, Ajout, remplacement)
setTasks(updateTask);
}



//useEffect
const [datas, setDatas] = useState('');
//loading
const [loading, setLoading] = useState(true);

let RecupJson = async()=>{
let result = await fetch('mesdonnees.json');
let dataJson = await result.json();
setDatas(dataJson);
setLoading(false);
}

useEffect(()=>{
RecupJson();
}, [])

console.log(datas); 

return (                                    
<div className={`${styles.div} bordure`}>
{
loading?
(<p>chargement en cours ....</p>) : (datas.message)

}



<h3><span className="material-symbols-outlined">add</span>
Tache
</h3>
<div>
<input type="text" name="tache" id="tache"
value={newTask}
onChange={(e)=>setNewTask(e.target.value)}
placeholder="Ajouter tache"/>

<input type = "submit" value = "Valider"
onClick={addTask}
/>
</div>
<h4><span className="material-symbols-outlined">task</span>
Liste des taches
</h4>

<ul>
{
tasks.map((tache, index) => (
<li key={index}>{tache}
<button
className={styles.delete}
onClick={()=>deleteTask(index)}
>
<span className="material-symbols-outlined">delete</span>
</button>

</li>))
}
</ul>
</div>
);
}
