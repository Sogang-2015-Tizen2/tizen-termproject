<?php

$servername = "localhost";
$username = "cs20101649";
$password = "qwer1234";
$dbname = "db_20101649";

$conn = new mysqli($servername, $username, $password, $dbname);

if($conn->connect_error){
	die("Connection failed : " . $conn->connect_error);
}


$sql = "SELECT num, lat, lng FROM RENTAL";
$result = $conn->query($sql);

$count = $result->num_rows;
echo $count . "/";


 while ( $row = $result->fetch_assoc() ){	
	echo $row["num"] . "/" . $row["lat"] . "/" . $row["lng"] . "/";
//	echo(json_encode($row));
}

$conn->close();

?>


