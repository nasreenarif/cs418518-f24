export default function PropComponent(props){
    return (<>
    <div>
        <h6>{props.title}</h6>
        <p>{props.description}</p>
        {props.children}
    </div>
    </>)
}

///defining props with attribut
// export default function PropComponent({title, description}){
//     return (<>
//     <div>
//         <h6>{title}</h6>
//         <p>{description}</p>
//     </div>
//     </>)
// }