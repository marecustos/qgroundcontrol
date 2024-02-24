add_library(PayloadLib
	payload.cc
)

add_custom_target(PayloadLibQml
	SOURCES
		Payload.qml
)

target_link_libraries(PayloadLib

	PRIVATE
		qgc
	
	PUBLIC
		Qt5::Widgets
)
target_include_directories(PayloadLib INTERFACE ${CMAKE_CURRENT_SOURCE_DIR} )

