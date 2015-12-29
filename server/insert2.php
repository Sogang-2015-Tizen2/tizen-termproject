<?php

$servername = "localhost";
$username = "cs20101649";
$password = "qwer1234";
$dbname = "db_20101649";

$conn = new mysqli($servername, $username, $password, $dbname);

if($conn->connect_error){
	die("Connection failed : " . $conn->connect_error);
}


$num = $_POST["num"];
$lat = $_POST["lat"];
$lng = $_POST["lng"];



$sql = "INSERT INTO RENTAL (num, lat, lng)
		VALUES (\"$num\", \"$lat\", \"$lng\")";



if( $conn->query($sql) === TRUE ){
	echo "New record created successfully<br>";

}
else{
	echo "Error Inserting table :" . $conn->error . "<br>"; 
}


	$sql = "SELECT id, num, addr, lat, lng FROM RENTAL";
	$result = $conn->query($sql);

	if($result->num_rows > 0){
		while($row = $result->fetch_assoc()){
			echo json_encode($row);					
			//echo "id: " . $row["id"]. " - Name: " . $row["firstname"] . " " . $row["lastname"] . "<br>";
		}
	}
	else{
		echo "0 results<br>";
	}


$conn->close();

?>
