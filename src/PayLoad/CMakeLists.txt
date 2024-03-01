add_library(PayloadLib
	payload.cc
)

add_custom_target(PayloadLibQml
	SOURCES
		Payload.qml
)
if(UNIX AND NOT APPLE)
    # Fixes QWebEngine linker errors on Ubuntu 22.04
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -fuse-ld=gold")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fuse-ld=gold")
endif()

find_package(Qt5 COMPONENTS WebEngine REQUIRED)
target_link_libraries(PayloadLib

	PRIVATE
		qgc
	
	PUBLIC
		Qt5::Widgets
)
target_include_directories(PayloadLib INTERFACE ${CMAKE_CURRENT_SOURCE_DIR} )

