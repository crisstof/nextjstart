'use client'
import { useEffect, useState } from 'react';
import styles from '../component/loading.module.css';
import Image from "next/image";
import  {Loading} from '../component/loading';


export default  function Meteo() {

const [datas, setDatas] = useState(''); 
const [country, SetCountry] = useState('Paris'); 
const [load,setLoad] = useState(true); //le getter à tri=ue et le setter sera appelé dans la fct meteo() pour changer la valeur
                                      //et condition ternaire dans le html
let meteo = async()=>{
  try {
    setLoad(true);//ajout
    const url = "https://api.openweathermap.org/data/2.5/weather?" +
                                "q="+country+"&appid=xxxxxxxxxxxxxxxxxxxxxxx&units=metric";
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error('Erreur lors de la récupération des données météo');
    }
    let valeur = await res.json();
    console.log(valeur);
    setDatas(valeur); // Mise à jour de `datas`
  } catch (error) {
    console.error(error);
    
  }finally {
    setLoad(false); //deblloque toujours le chargement
  }
};

useEffect(()=>{
  meteo();
  console.log(datas)
},[country])




  return (
    <div className={styles.div}>
      
       <div>
          < h2>Afficher la météo</h2>

          <select
          name = "ville"
          id="ville"
          value={country}
          onChange={e => SetCountry(e.target.value)}
          >
          <option value="Paris">Paris</option>
          <option value="Lyon">lyon</option>
          <option value="Marseille">Marseille</option>
          <option value="Toulouse">Toulouse</option>
          <option value="Issoire">Issoire</option>
          </select>

            <div>
              {
                load? <Loading/> : (
                  <>
                   <h3>Météo à {datas?.name || 'inconnue'}</h3> 
                   <p>Température {datas?.main?.temp || 'N/A'} °C</p> 
                   </>             
                )
              }
                  
            </div>
      
           </div> 

         
        </div>
     
      
   
  );
}

